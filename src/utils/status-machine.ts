import { siteConfig } from '@/config/site';
import { diffInCalendarDays } from './date';

export type ChallengeStatus = 'alive' | 'warning' | 'danger' | 'dead' | 'victory';

export interface StatusInput {
  lastSubmissionDate: string | null; // 最后提交日期 YYYY-MM-DD
  currentDate: string;               // 当前日期 YYYY-MM-DD
  day: number;                       // 当前第几天
  maxDays: number;                   // 最大天数
  currentAmount: number;             // 当前金额（分）
  targetAmount: number;              // 目标金额（分）
}

/**
 * 纯函数：计算当前挑战状态
 */
export function computeStatus(input: StatusInput): ChallengeStatus {
  const { lastSubmissionDate, currentDate, day, maxDays, currentAmount, targetAmount } = input;

  // 已达成目标
  if (currentAmount >= targetAmount) {
    // 超过最大天数 → victory（胜利完成）
    if (day > maxDays) return 'victory';
    // 还在挑战期内 → alive（继续收集收入）
    return 'alive';
  }

  // 未达成目标且超过最大天数 → dead
  if (day > maxDays) return 'dead';

  // 计算距离最后一次提交的天数
  let daysSinceLastSubmission: number;

  if (!lastSubmissionDate) {
    // 还没有提交过，从第1天开始算
    daysSinceLastSubmission = day - 1;
  } else {
    daysSinceLastSubmission = diffInCalendarDays(lastSubmissionDate, currentDate);
  }

  // 状态降级
  if (daysSinceLastSubmission >= siteConfig.challenge.dangerDays) return 'danger';
  if (daysSinceLastSubmission >= siteConfig.challenge.warningDays) return 'warning';
  return 'alive';
}

/**
 * 守卫：是否可以提交行动
 */
export function canSubmitAction(status: ChallengeStatus): boolean {
  return status !== 'dead' && status !== 'victory';
}

/**
 * 守卫：是否可以创建新挑战
 */
export function canStartChallenge(status: ChallengeStatus | null): boolean {
  return status === null || status === 'dead' || status === 'victory';
}

/**
 * 状态文本映射
 */
export const statusTextMap: Record<ChallengeStatus, string> = {
  alive: '活着',
  warning: '危险',
  danger: '濒死',
  dead: '死亡',
  victory: '胜利',
};

/**
 * 状态 Badge variant 映射
 */
export const statusBadgeMap: Record<ChallengeStatus, 'default' | 'warning' | 'danger' | 'dead' | 'secondary'> = {
  alive: 'default',
  warning: 'warning',
  danger: 'danger',
  dead: 'dead',
  victory: 'default',
};
