import 'server-only';

import { siteConfig } from '@/config/site';
import { getDb } from '@/db';
import { creditAccount, creditBatch, creditTransaction } from '@/db/schema';
import { type User, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Better Auth 实例（惰性初始化）
 *
 * 为什么用惰性初始化？
 * - Next.js 构建时会预加载所有模块，此时 DATABASE_URL 可能为空
 * - 惰性初始化确保只有在实际使用 auth 时才连接数据库
 * - 配合 Neon serverless，冷启动时才建立连接
 */
let authInstance: any = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  const db = await getDb();

  authInstance = betterAuth({
    baseURL:
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000',
    appName: siteConfig.name,
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60, // 1 hour cache
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    },
    emailAndPassword: {
      enabled: siteConfig.auth.enableCredentialLogin,
      // MVP: do not require email verification for simplicity
      requireEmailVerification: false,
    },
    socialProviders: {
      // GitHub OAuth
      ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
            },
          }
        : {}),
      // Google OAuth
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await onCreateUser(user);
          },
        },
      },
    },
  });

  return authInstance;
}

/**
 * 用户创建后钩子 — 创建积分账户并赠送注册积分
 */
async function onCreateUser(user: User) {
  try {
    const db = await getDb();
    const registerGift = siteConfig.credits.registerGift;

    // 防御性检查：用户是否已有积分账户
    const existing = await db
      .select()
      .from(creditAccount)
      .where(eq(creditAccount.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`User ${user.id} already has a credit account`);
      return;
    }

    const now = new Date();
    const batchNo = `REG-${nanoid(12)}`;
    const transactionNo = `TX-${nanoid(16)}`;

    // 1. 创建积分账户
    await db.insert(creditAccount).values({
      id: nanoid(),
      userId: user.id,
      currentCredits: registerGift,
      totalEarned: registerGift,
      totalConsumed: 0,
      totalExpired: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    // 2. 创建积分批次
    const batchResult = await db
      .insert(creditBatch)
      .values({
        id: nanoid(),
        userId: user.id,
        batchNo,
        transactionType: 'REGISTER_GIFT',
        totalAmount: registerGift,
        remainingAmount: registerGift,
        description: `注册赠送：${registerGift} 积分`,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: creditBatch.id });

    const batchId = batchResult[0]?.id;

    // 3. 记录流水
    await db.insert(creditTransaction).values({
      id: nanoid(),
      userId: user.id,
      transactionNo,
      type: 'REGISTER_GIFT',
      direction: 'IN',
      amount: registerGift,
      balanceAfter: registerGift,
      batchId,
      description: `注册赠送：${registerGift} 积分`,
      sourceType: 'SYSTEM',
      createdAt: now,
    });

    console.log(
      `Created credit account for user ${user.id} with ${registerGift} credits`
    );
  } catch (error) {
    console.error('onCreateUser error:', error);
  }
}
