import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { challenge, submission } from '@/db/schema';
import type { Challenge, Submission } from '@/db/types';
import { generateId } from '@/lib/utils';
import { getLocalDateStr, diffInCalendarDays } from '@/utils/date';
import {
  computeStatus,
  canSubmitAction,
  type ChallengeStatus,
} from '@/utils/status-machine';
import { siteConfig } from '@/config/site';
import type {
  CreateChallengeInput,
  SubmitActionInput,
  ChallengeWithStatus,
} from './types';

/**
 * 获取用户当前挑战
 */
export async function getCurrentChallenge(
  userId: string
): Promise<ChallengeWithStatus | null> {
  const db = await getDb();

  const [currentChallenge] = await db
    .select()
    .from(challenge)
    .where(and(eq(challenge.userId, userId)))
    .orderBy(desc(challenge.createdAt))
    .limit(1);

  if (!currentChallenge) return null;

  return enrichChallenge(currentChallenge);
}

/**
 * 创建新挑战
 */
export async function createChallenge(
  userId: string,
  input: CreateChallengeInput
): Promise<ChallengeWithStatus> {
  const db = await getDb();
  const today = getLocalDateStr();

  // 检查是否有进行中的挑战
  const existing = await getCurrentChallenge(userId);
  if (existing && canSubmitAction(existing.status)) {
    throw new Error('已有进行中的挑战');
  }

  const [newChallenge] = await db
    .insert(challenge)
    .values({
      id: generateId(),
      userId,
      name: input.name,
      target: input.target, // 数据库存分
      current: 0,
      day: 1,
      maxDays: siteConfig.challenge.maxDays,
      status: 'alive',
      lastSubmissionDate: null,
    })
    .returning();

  return enrichChallenge(newChallenge);
}

/**
 * 提交行动
 */
export async function submitAction(
  userId: string,
  challengeId: string,
  input: SubmitActionInput
): Promise<{
  success: boolean;
  challenge: ChallengeWithStatus;
  submission: Submission;
}> {
  const db = await getDb();
  const today = getLocalDateStr();

  // 获取挑战
  const [currentChallenge] = await db
    .select()
    .from(challenge)
    .where(and(eq(challenge.id, challengeId), eq(challenge.userId, userId)));

  if (!currentChallenge) {
    throw new Error('挑战不存在');
  }

  const currentStatus = computeStatus({
    lastSubmissionDate: currentChallenge.lastSubmissionDate,
    currentDate: today,
    day: currentChallenge.day,
    maxDays: currentChallenge.maxDays,
    currentAmount: currentChallenge.current,
    targetAmount: currentChallenge.target,
  });

  if (!canSubmitAction(currentStatus)) {
    throw new Error('当前状态无法提交行动');
  }

  // 计算新的 day
  let newDay = currentChallenge.day;
  if (currentChallenge.lastSubmissionDate) {
    const daysDiff = diffInCalendarDays(currentChallenge.lastSubmissionDate, today);
    if (daysDiff > 0) {
      newDay = currentChallenge.day + daysDiff;
    }
  }
  // 如果没有上次提交日期且 day=1，保持 day=1

  // 新的当前金额
  const newCurrent = currentChallenge.current + input.amount;

  // 检查是否超过 maxDays
  // 提交的是今天的行动，所以 day 应该是 newDay
  // 如果 newDay > maxDays 且未达标，则死亡
  const isDead = newDay > currentChallenge.maxDays && newCurrent < currentChallenge.target;
  if (isDead) {
    throw new Error('挑战已结束');
  }

  // 创建提交记录
  const [newSubmission] = await db
    .insert(submission)
    .values({
      id: generateId(),
      challengeId,
      userId,
      day: newDay,
      action: input.action,
      amount: input.amount,
      note: input.note || null,
      screenshotUrl: input.screenshotUrl || null,
      date: today,
    })
    .returning();

  // 更新挑战
  const [updatedChallenge] = await db
    .update(challenge)
    .set({
      current: newCurrent,
      day: newDay,
      lastSubmissionDate: today,
      updatedAt: new Date(),
    })
    .where(eq(challenge.id, challengeId))
    .returning();

  return {
    success: true,
    challenge: enrichChallenge(updatedChallenge),
    submission: newSubmission,
  };
}

/**
 * 获取提交记录列表
 */
export async function getSubmissions(
  challengeId: string,
  limit: number = 20
): Promise<Submission[]> {
  const db = await getDb();

  const submissions = await db
    .select()
    .from(submission)
    .where(eq(submission.challengeId, challengeId))
    .orderBy(desc(submission.createdAt))
    .limit(limit);

  return submissions;
}

/**
 * 给挑战数据增加派生字段
 */
function enrichChallenge(c: Challenge): ChallengeWithStatus {
  const today = getLocalDateStr();
  const status = computeStatus({
    lastSubmissionDate: c.lastSubmissionDate,
    currentDate: today,
    day: c.day,
    maxDays: c.maxDays,
    currentAmount: c.current,
    targetAmount: c.target,
  });

  const progress = Math.min((c.current / c.target) * 100, 100);
  const daysLeft = Math.max(0, c.maxDays - c.day + 1);
  const revenueLeft = Math.max(0, c.target - c.current);

  let daysSinceLastSubmission: number;
  if (!c.lastSubmissionDate) {
    daysSinceLastSubmission = c.day - 1;
  } else {
    daysSinceLastSubmission = diffInCalendarDays(c.lastSubmissionDate, today);
  }

  return {
    ...c,
    status,
    progress,
    daysLeft,
    revenueLeft,
    daysSinceLastSubmission,
  };
}
