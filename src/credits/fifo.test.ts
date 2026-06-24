import { describe, it, expect } from 'vitest';
import { calculateFifoConsume, type CreditBatchForConsume } from '@/credits/fifo';

/**
 * FIFO 积分消耗算法单元测试
 */
describe('calculateFifoConsume - FIFO积分消耗', () => {
  // 辅助函数：创建批次
  function makeBatch(
    id: string,
    remaining: number,
    expireAt: Date | null = null,
    createdAt?: Date
  ): CreditBatchForConsume {
    return {
      id,
      remainingAmount: remaining,
      expireAt,
      createdAt: createdAt ?? new Date('2024-01-01'),
    };
  }

  describe('基础消耗', () => {
    it('消耗数量≤0 → 失败', () => {
      const batches = [makeBatch('b1', 10)];
      expect(calculateFifoConsume(batches, 0).success).toBe(false);
      expect(calculateFifoConsume(batches, -1).success).toBe(false);
    });

    it('积分不足 → 失败', () => {
      const batches = [makeBatch('b1', 5)];
      const result = calculateFifoConsume(batches, 10);
      expect(result.success).toBe(false);
      expect(result.error).toBe('积分不足');
      expect(result.batchUpdates).toHaveLength(0);
    });

    it('单个批次足够 → 消耗该批次', () => {
      const batches = [makeBatch('b1', 10)];
      const result = calculateFifoConsume(batches, 3);
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(3);
      expect(result.batchUpdates).toEqual([
        { id: 'b1', remaining: 7 },
      ]);
    });

    it('单个批次刚好够 → 清零', () => {
      const batches = [makeBatch('b1', 5)];
      const result = calculateFifoConsume(batches, 5);
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(5);
      expect(result.batchUpdates).toEqual([
        { id: 'b1', remaining: 0 },
      ]);
    });
  });

  describe('多批次消耗（FIFO - 按创建时间）', () => {
    it('两个永久批次 → 先消耗早创建的', () => {
      const batches = [
        makeBatch('b1', 5, null, new Date('2024-01-01')), // 早
        makeBatch('b2', 10, null, new Date('2024-01-10')), // 晚
      ];
      const result = calculateFifoConsume(batches, 7);
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(7);
      // b1 全部消耗（5），b2 消耗2
      expect(result.batchUpdates).toEqual([
        { id: 'b1', remaining: 0 },
        { id: 'b2', remaining: 8 },
      ]);
    });

    it('消耗跨多个批次', () => {
      const batches = [
        makeBatch('b1', 3, null, new Date('2024-01-01')),
        makeBatch('b2', 4, null, new Date('2024-01-05')),
        makeBatch('b3', 5, null, new Date('2024-01-10')),
      ];
      const result = calculateFifoConsume(batches, 10);
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(10);
      // b1: 3→0, b2: 4→0, b3: 5→2
      expect(result.batchUpdates).toEqual([
        { id: 'b1', remaining: 0 },
        { id: 'b2', remaining: 0 },
        { id: 'b3', remaining: 2 },
      ]);
    });
  });

  describe('过期优先策略', () => {
    it('有过期时间的批次优先于永久批次', () => {
      const soon = new Date('2024-01-20');
      const later = new Date('2024-01-10'); // 永久批次（expireAt=null）但创建更早
      const batches = [
        makeBatch('permanent', 10, null, later),           // 永久，但创建早
        makeBatch('expiring', 5, soon, new Date('2024-01-15')), // 即将过期
      ];
      const result = calculateFifoConsume(batches, 3);
      expect(result.success).toBe(true);
      // 应该先消耗即将过期的 expiring
      expect(result.batchUpdates[0].id).toBe('expiring');
      expect(result.batchUpdates[0].remaining).toBe(2);
    });

    it('两个有过期时间的批次 → 先过期的优先', () => {
      const expireSoon = new Date('2024-01-20');
      const expireLater = new Date('2024-01-30');
      const batches = [
        makeBatch('later', 10, expireLater, new Date('2024-01-01')), // 创建早但过期晚
        makeBatch('soon', 10, expireSoon, new Date('2024-01-10')),   // 创建晚但过期早
      ];
      const result = calculateFifoConsume(batches, 5);
      expect(result.success).toBe(true);
      // 过期早的先消耗
      expect(result.batchUpdates[0].id).toBe('soon');
      expect(result.batchUpdates[0].remaining).toBe(5);
    });

    it('过期时间相同 → 按创建时间', () => {
      const sameExpire = new Date('2024-01-30');
      const batches = [
        makeBatch('b2', 10, sameExpire, new Date('2024-01-10')), // 晚创建
        makeBatch('b1', 10, sameExpire, new Date('2024-01-01')), // 早创建
      ];
      const result = calculateFifoConsume(batches, 5);
      expect(result.success).toBe(true);
      expect(result.batchUpdates[0].id).toBe('b1'); // 创建早的先消耗
    });
  });

  describe('边界情况', () => {
    it('空批次列表 → 任何消耗都失败', () => {
      expect(calculateFifoConsume([], 1).success).toBe(false);
    });

    it('0余量批次传入时也会被正确跳过（consumeFromBatch=0）', () => {
      // 注意：实际调用时数据库已过滤 remainingAmount>0，
      // 但纯函数对于0余量批次也不会消耗（Math.min(0, x)=0）
      const batches = [
        { id: 'empty', remainingAmount: 0, expireAt: null, createdAt: new Date('2024-01-01') },
        makeBatch('b1', 5, null, new Date('2024-01-02')),
      ];
      const result = calculateFifoConsume(batches, 3);
      expect(result.success).toBe(true);
      // empty 批次 remaining 仍为 0（不会变负），b1 被正确消耗
      expect(result.batchUpdates).toEqual([
        { id: 'empty', remaining: 0 },
        { id: 'b1', remaining: 2 },
      ]);
    });

    it('混合场景：过期批次 + 永久批次 + 不同过期时间', () => {
      const expire1 = new Date('2024-01-15'); // 最早过期
      const expire2 = new Date('2024-01-25'); // 较晚过期
      const batches = [
        makeBatch('perm2', 20, null, new Date('2024-01-01')),        // 永久，最早创建
        makeBatch('exp2', 8, expire2, new Date('2024-01-05')),       // 较晚过期
        makeBatch('exp1', 3, expire1, new Date('2024-01-10')),       // 最早过期
        makeBatch('perm1', 5, null, new Date('2024-01-12')),         // 永久，晚创建
      ];

      // 消耗顺序应该是：exp1(3) → exp2(8) → perm2(20) → perm1(5)
      const result = calculateFifoConsume(batches, 15);
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(15);

      const ids = result.batchUpdates.map(u => u.id);
      expect(ids).toEqual(['exp1', 'exp2', 'perm2']);
      // exp1: 3→0, exp2: 8→0, perm2: 20→16
      expect(result.batchUpdates).toEqual([
        { id: 'exp1', remaining: 0 },
        { id: 'exp2', remaining: 0 },
        { id: 'perm2', remaining: 16 },
      ]);
    });
  });
});
