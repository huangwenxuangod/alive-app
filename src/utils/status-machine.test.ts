import { describe, it, expect } from 'vitest';
import {
  computeStatus,
  canSubmitAction,
  canStartChallenge,
  statusTextMap,
  type ChallengeStatus,
} from '@/utils/status-machine';

/**
 * 状态机单元测试
 *
 * 测试覆盖：
 * - 初始状态（无提交）
 * - 每日提交 → 保持 alive
 * - 2天未提交 → warning
 * - 3天未提交 → danger
 * - 达成目标但未到30天 → alive（继续存活）
 * - 达成目标且超过30天 → victory
 * - 未达成目标且超过30天 → dead
 * - canSubmitAction / canStartChallenge 守卫
 * - 边界情况
 */
describe('computeStatus - 状态计算', () => {
  const today = '2024-01-15';

  describe('初始状态（无提交）', () => {
    it('Day 1 未提交 → alive（还没到2天）', () => {
      const status = computeStatus({
        lastSubmissionDate: null,
        currentDate: today,
        day: 1,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });

    it('Day 2 未提交 → warning（从第1天开始算，差2天）', () => {
      const status = computeStatus({
        lastSubmissionDate: null,
        currentDate: today,
        day: 3, // day-1 = 2 天未提交
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('warning');
    });

    it('Day 4 未提交 → danger（day-1 = 3 天未提交）', () => {
      const status = computeStatus({
        lastSubmissionDate: null,
        currentDate: today,
        day: 4,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('danger');
    });
  });

  describe('每日提交 → alive', () => {
    it('每天都提交，始终 alive', () => {
      for (let day = 1; day <= 30; day++) {
        const status = computeStatus({
          lastSubmissionDate: today, // 今天刚提交
          currentDate: today,
          day,
          maxDays: 30,
          currentAmount: day * 10, // 每天赚10分
          targetAmount: 1000,
        });
        expect(status).toBe('alive');
      }
    });
  });

  describe('状态降级', () => {
    it('最后提交是昨天（差1天）→ alive', () => {
      const status = computeStatus({
        lastSubmissionDate: '2024-01-14',
        currentDate: '2024-01-15',
        day: 5,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });

    it('最后提交是2天前 → warning', () => {
      const status = computeStatus({
        lastSubmissionDate: '2024-01-13',
        currentDate: '2024-01-15',
        day: 5,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('warning');
    });

    it('最后提交是3天前 → danger', () => {
      const status = computeStatus({
        lastSubmissionDate: '2024-01-12',
        currentDate: '2024-01-15',
        day: 5,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('danger');
    });

    it('最后提交是5天前 → 仍然 danger（danger 是终态前的最低状态）', () => {
      const status = computeStatus({
        lastSubmissionDate: '2024-01-10',
        currentDate: '2024-01-15',
        day: 10,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('danger');
    });

    it('提交后立即恢复 alive', () => {
      // 先处于 danger
      let status = computeStatus({
        lastSubmissionDate: '2024-01-12',
        currentDate: '2024-01-15',
        day: 5,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('danger');

      // 今天提交了，恢复 alive
      status = computeStatus({
        lastSubmissionDate: '2024-01-15',
        currentDate: '2024-01-15',
        day: 5,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });
  });

  describe('目标达成', () => {
    it('金额刚好达到目标，Day 15 → alive（继续存活至30天）', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 15,
        maxDays: 30,
        currentAmount: 1000,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });

    it('金额超过目标，Day 20 → alive', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 20,
        maxDays: 30,
        currentAmount: 1500,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });

    it('金额达到目标，Day 31 → victory', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 31,
        maxDays: 30,
        currentAmount: 1000,
        targetAmount: 1000,
      });
      expect(status).toBe('victory');
    });
  });

  describe('超时未达标 → dead', () => {
    it('Day 31，金额 500/1000 → dead', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 31,
        maxDays: 30,
        currentAmount: 500,
        targetAmount: 1000,
      });
      expect(status).toBe('dead');
    });

    it('Day 31，金额 0/1000，5天未提交 → dead（dead 优先级高于 danger）', () => {
      const status = computeStatus({
        lastSubmissionDate: '2024-01-10',
        currentDate: '2024-01-15',
        day: 31,
        maxDays: 30,
        currentAmount: 0,
        targetAmount: 1000,
      });
      expect(status).toBe('dead');
    });
  });

  describe('边界情况', () => {
    it('目标金额为1分（最小目标），Day 1 达成 → alive', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 1,
        maxDays: 30,
        currentAmount: 1,
        targetAmount: 1,
      });
      expect(status).toBe('alive');
    });

    it('Day 30，刚好达标 → alive（不是 victory，因为 day 不大于 maxDays）', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 30,
        maxDays: 30,
        currentAmount: 1000,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });

    it('Day 30，未达标但有提交 → alive/warning/danger（看提交时间）', () => {
      const status = computeStatus({
        lastSubmissionDate: today,
        currentDate: today,
        day: 30,
        maxDays: 30,
        currentAmount: 500,
        targetAmount: 1000,
      });
      expect(status).toBe('alive');
    });
  });
});

describe('canSubmitAction - 提交守卫', () => {
  const testCases: [ChallengeStatus, boolean][] = [
    ['alive', true],
    ['warning', true],
    ['danger', true],
    ['dead', false],
    ['victory', false],
  ];

  it.each(testCases)('状态 %s → 可提交: %s', (status, expected) => {
    expect(canSubmitAction(status)).toBe(expected);
  });
});

describe('canStartChallenge - 创建新挑战守卫', () => {
  const testCases: [ChallengeStatus | null, boolean][] = [
    [null, true],         // 没有挑战
    ['alive', false],     // 进行中
    ['warning', false],
    ['danger', false],
    ['dead', true],       // 死亡后可以重新开始
    ['victory', true],    // 胜利后可以重新开始
  ];

  it.each(testCases)('当前状态 %s → 可创建新挑战: %s', (status, expected) => {
    expect(canStartChallenge(status)).toBe(expected);
  });
});

describe('statusTextMap - 状态文本', () => {
  it('所有状态都有对应的中文文本', () => {
    expect(statusTextMap.alive).toBe('活着');
    expect(statusTextMap.warning).toBe('危险');
    expect(statusTextMap.danger).toBe('濒死');
    expect(statusTextMap.dead).toBe('死亡');
    expect(statusTextMap.victory).toBe('胜利');
  });

  it('覆盖所有5种状态', () => {
    const keys = Object.keys(statusTextMap);
    expect(keys).toHaveLength(5);
    expect(keys).toContain('alive');
    expect(keys).toContain('warning');
    expect(keys).toContain('danger');
    expect(keys).toContain('dead');
    expect(keys).toContain('victory');
  });
});
