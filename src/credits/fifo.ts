/**
 * 积分 FIFO 消耗算法（纯函数，可独立测试）
 *
 * 策略：优先消耗即将过期的积分，其次消耗最早获得的积分
 */

export interface CreditBatchForConsume {
  id: string;
  remainingAmount: number;
  expireAt: Date | null;
  createdAt: Date;
}

export interface FifoConsumeResult {
  success: boolean;
  error?: string;
  /** 需要更新的批次 [{id, remaining}] */
  batchUpdates: { id: string; remaining: number }[];
  /** 实际消耗的数量 */
  consumed: number;
}

/**
 * 纯函数：FIFO 消耗积分
 *
 * 排序规则：
 * 1. 有过期时间的批次排在前面（即将过期的优先消耗）
 * 2. 过期时间早的排在前面
 * 3. 创建时间早的排在前面
 */
export function calculateFifoConsume(
  batches: CreditBatchForConsume[],
  amount: number
): FifoConsumeResult {
  if (amount <= 0) {
    return { success: false, error: '消耗数量必须大于0', batchUpdates: [], consumed: 0 };
  }

  // 计算总可用积分
  const totalAvailable = batches.reduce((sum, b) => sum + b.remainingAmount, 0);
  if (totalAvailable < amount) {
    return { success: false, error: '积分不足', batchUpdates: [], consumed: 0 };
  }

  // 排序：有过期时间的优先 → 过期时间升序 → 创建时间升序
  const sortedBatches = [...batches].sort((a, b) => {
    // null 排在后面（isNull 为 true 即 1，排在后面）
    const aHasExpire = a.expireAt !== null ? 0 : 1;
    const bHasExpire = b.expireAt !== null ? 0 : 1;
    if (aHasExpire !== bHasExpire) return aHasExpire - bHasExpire;

    // 都有过期时间 → 按过期时间升序
    if (a.expireAt && b.expireAt) {
      const expireDiff = a.expireAt.getTime() - b.expireAt.getTime();
      if (expireDiff !== 0) return expireDiff;
    }

    // 按创建时间升序
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const batchUpdates: { id: string; remaining: number }[] = [];
  let remainingToConsume = amount;

  for (const batch of sortedBatches) {
    if (remainingToConsume <= 0) break;

    const consumeFromBatch = Math.min(batch.remainingAmount, remainingToConsume);
    const newRemaining = batch.remainingAmount - consumeFromBatch;

    batchUpdates.push({ id: batch.id, remaining: newRemaining });
    remainingToConsume -= consumeFromBatch;
  }

  return {
    success: true,
    batchUpdates,
    consumed: amount - remainingToConsume,
  };
}
