import { z } from 'zod';
import type { Challenge, Submission } from '@/db/types';
import type { ChallengeStatus } from '@/utils/status-machine';

// ====== Zod Schemas ======

export const createChallengeSchema = z.object({
  name: z.string().min(1, '昵称不能为空').max(50, '昵称最多50个字符'),
  target: z.number().int().positive('目标金额必须大于0'),
});

export const submitActionSchema = z.object({
  action: z.string().min(1, '行动描述不能为空').max(500, '行动描述最多500字'),
  amount: z.number().int().min(0, '金额不能为负数'),
  note: z.string().max(500, '备注最多500字').optional(),
  screenshotUrl: z.string().optional(),
  screenshotData: z.string().max(700000, '截图数据过大').optional(), // base64 ≤ ~500KB
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type SubmitActionInput = z.infer<typeof submitActionSchema>;

// ====== 领域类型 ======

export interface ChallengeWithStatus extends Challenge {
  status: ChallengeStatus;
  progress: number;        // 0-100
  daysLeft: number;
  revenueLeft: number;     // 分
  daysSinceLastSubmission: number;
}

export interface SubmissionWithRelations extends Submission {
  // 未来可扩展 user 等
}

/**
 * 统一的 Action 返回结果类型
 */
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ====== Query Keys ======

export const challengeKeys = {
  all: ['challenge'] as const,
  current: () => [...challengeKeys.all, 'current'] as const,
  submissions: (challengeId: string) => [...challengeKeys.all, 'submissions', challengeId] as const,
};
