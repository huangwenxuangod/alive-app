import 'server-only';
import { and, asc, eq, gt, isNull, lt, desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { creditAccount, creditBatch, creditTransaction } from '@/db/schema';
import type { CreditAccount, CreditBatch } from '@/db/types';
import { generateId } from '@/lib/utils';
import { CREDIT_TRANSACTION_TYPE } from '@/config/credits';
import { siteConfig } from '@/config/site';

export interface CreditResult {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface AddCreditsParams {
  userId: string;
  amount: number;
  type: string;
  description: string;
  sourceType?: string;
  sourceId?: string;
  expireDays?: number;
  idempotencyKey?: string; // 幂等键
}

export interface ConsumeCreditsParams {
  userId: string;
  amount: number;
  type: string;
  description: string;
  sourceType?: string;
  sourceId?: string;
}

/**
 * 获取用户积分账户
 */
export async function getCreditAccount(userId: string): Promise<CreditAccount | null> {
  const db = await getDb();

  const [account] = await db
    .select()
    .from(creditAccount)
    .where(eq(creditAccount.userId, userId));

  return account || null;
}

/**
 * 获取用户积分余额
 */
export async function getCreditBalance(userId: string): Promise<number> {
  // 先做懒过期处理
  await processExpiredCredits(userId);

  const account = await getCreditAccount(userId);
  return account?.currentCredits ?? 0;
}

/**
 * 增加积分
 */
export async function addCredits(params: AddCreditsParams): Promise<CreditResult> {
  const { userId, amount, type, description, sourceType, sourceId, expireDays, idempotencyKey } = params;

  if (amount <= 0) {
    return { success: false, error: '积分数量必须大于0' };
  }

  const db = await getDb();

  // 幂等检查
  if (idempotencyKey) {
    const existingTx = await db
      .select()
      .from(creditTransaction)
      .where(and(
        eq(creditTransaction.transactionNo, idempotencyKey),
        eq(creditTransaction.userId, userId),
      ))
      .limit(1);

    if (existingTx.length > 0) {
      // 幂等命中，返回当前余额
      const balance = await getCreditBalance(userId);
      return { success: true, balance };
    }
  }

  const batchNo = idempotencyKey || `batch_${generateId()}`;
  const txNo = idempotencyKey || `tx_${generateId()}`;

  // 计算过期时间
  let expireAt: Date | null = null;
  if (expireDays && expireDays > 0) {
    expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expireDays);
  }

  try {
    // 1. 确保账户存在
    let account = await getCreditAccount(userId);
    if (!account) {
      const [newAccount] = await db
        .insert(creditAccount)
        .values({
          id: generateId(),
          userId,
          currentCredits: 0,
          totalEarned: 0,
          totalConsumed: 0,
          totalExpired: 0,
          version: 0,
        })
        .returning();
      account = newAccount;
    }

    // 2. 创建积分批次
    await db.insert(creditBatch).values({
      id: generateId(),
      userId,
      batchNo,
      transactionType: type,
      totalAmount: amount,
      remainingAmount: amount,
      expireAt,
      sourceId,
      description,
    });

    // 3. 更新账户余额
    const [updatedAccount] = await db
      .update(creditAccount)
      .set({
        currentCredits: account.currentCredits + amount,
        totalEarned: account.totalEarned + amount,
        updatedAt: new Date(),
      })
      .where(eq(creditAccount.id, account.id))
      .returning();

    // 4. 记录流水
    await db.insert(creditTransaction).values({
      id: generateId(),
      userId,
      transactionNo: txNo,
      type,
      direction: 'IN',
      amount,
      balanceAfter: updatedAccount.currentCredits,
      description,
      sourceType,
      sourceId,
    });

    return { success: true, balance: updatedAccount.currentCredits };
  } catch (error) {
    console.error('addCredits error:', error);
    return { success: false, error: error instanceof Error ? error.message : '添加积分失败' };
  }
}

/**
 * 消耗积分（FIFO 策略，优先消耗即将过期的）
 */
export async function consumeCredits(params: ConsumeCreditsParams): Promise<CreditResult> {
  const { userId, amount, type, description, sourceType, sourceId } = params;

  if (amount <= 0) {
    return { success: false, error: '积分数量必须大于0' };
  }

  const db = await getDb();

  try {
    // 先处理过期积分
    await processExpiredCredits(userId);

    // 获取账户
    const account = await getCreditAccount(userId);
    if (!account || account.currentCredits < amount) {
      return { success: false, error: '积分不足' };
    }

    // 获取可用批次（按过期时间升序 = FIFO）
    const batches = await db
      .select()
      .from(creditBatch)
      .where(and(
        eq(creditBatch.userId, userId),
        gt(creditBatch.remainingAmount, 0),
      ))
      .orderBy(
        // 有过期时间的排在前面（isNull 为 false 即 0，排在前面），按过期时间升序；没有过期时间的排在后面
        asc(isNull(creditBatch.expireAt)),
        asc(creditBatch.expireAt),
        asc(creditBatch.createdAt),
      );

    let remainingToConsume = amount;
    const batchUpdates: { id: string; remaining: number }[] = [];

    // FIFO 扣减
    for (const batch of batches) {
      if (remainingToConsume <= 0) break;

      const consumeFromBatch = Math.min(batch.remainingAmount, remainingToConsume);
      const newRemaining = batch.remainingAmount - consumeFromBatch;

      batchUpdates.push({ id: batch.id, remaining: newRemaining });
      remainingToConsume -= consumeFromBatch;
    }

    if (remainingToConsume > 0) {
      return { success: false, error: '积分不足' };
    }

    // 执行批次更新
    for (const update of batchUpdates) {
      await db
        .update(creditBatch)
        .set({ remainingAmount: update.remaining, updatedAt: new Date() })
        .where(eq(creditBatch.id, update.id));
    }

    // 更新账户余额
    const [updatedAccount] = await db
      .update(creditAccount)
      .set({
        currentCredits: account.currentCredits - amount,
        totalConsumed: account.totalConsumed + amount,
        updatedAt: new Date(),
      })
      .where(eq(creditAccount.id, account.id))
      .returning();

    // 记录流水
    await db.insert(creditTransaction).values({
      id: generateId(),
      userId,
      transactionNo: `tx_${generateId()}`,
      type,
      direction: 'OUT',
      amount,
      balanceAfter: updatedAccount.currentCredits,
      description,
      sourceType,
      sourceId,
    });

    return { success: true, balance: updatedAccount.currentCredits };
  } catch (error) {
    console.error('consumeCredits error:', error);
    return { success: false, error: error instanceof Error ? error.message : '消耗积分失败' };
  }
}

/**
 * 懒过期：处理用户的过期积分
 */
export async function processExpiredCredits(userId: string): Promise<void> {
  const db = await getDb();
  const now = new Date();

  // 查询已过期但未清零的批次（expireAt 不为 null 且小于当前时间，且还有剩余积分）
  const expiredBatches = await db
    .select()
    .from(creditBatch)
    .where(and(
      eq(creditBatch.userId, userId),
      gt(creditBatch.remainingAmount, 0),
      // isNull(expireAt) 为 false 表示有过期时间，再判断是否已过期
      lt(creditBatch.expireAt, now),
    ));

  if (expiredBatches.length === 0) return;

  let totalExpired = 0;

  for (const batch of expiredBatches) {
    totalExpired += batch.remainingAmount;

    // 清零批次
    await db
      .update(creditBatch)
      .set({ remainingAmount: 0, updatedAt: new Date() })
      .where(eq(creditBatch.id, batch.id));

    // 记录过期流水
    await db.insert(creditTransaction).values({
      id: generateId(),
      userId,
      transactionNo: `expire_${batch.id}`,
      type: CREDIT_TRANSACTION_TYPE.EXPIRE,
      direction: 'OUT',
      amount: batch.remainingAmount,
      balanceAfter: 0, // 后面统一更新
      description: `积分过期（批次 ${batch.batchNo}）`,
      sourceType: 'EXPIRATION',
      sourceId: batch.id,
    });
  }

  // 更新账户
  if (totalExpired > 0) {
    const account = await getCreditAccount(userId);
    if (account) {
      const newBalance = Math.max(0, account.currentCredits - totalExpired);
      await db
        .update(creditAccount)
        .set({
          currentCredits: newBalance,
          totalExpired: account.totalExpired + totalExpired,
          updatedAt: new Date(),
        })
        .where(eq(creditAccount.id, account.id));

      // 更新过期流水的 balanceAfter
      for (const batch of expiredBatches) {
        await db
          .update(creditTransaction)
          .set({ balanceAfter: newBalance })
          .where(eq(creditTransaction.transactionNo, `expire_${batch.id}`));
      }
    }
  }
}

/**
 * 获取交易记录
 */
export async function getTransactions(userId: string, limit: number = 20) {
  const db = await getDb();

  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(limit);

  return transactions;
}

/**
 * 初始化用户积分账户（注册赠送）
 */
export async function initUserCredits(userId: string): Promise<void> {
  const existing = await getCreditAccount(userId);
  if (existing) return; // 已初始化

  await addCredits({
    userId,
    amount: siteConfig.credits.registerGift,
    type: CREDIT_TRANSACTION_TYPE.REGISTER_GIFT,
    description: '注册赠送积分',
    idempotencyKey: `register_gift_${userId}`,
  });
}
