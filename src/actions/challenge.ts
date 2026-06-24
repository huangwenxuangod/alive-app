'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { userActionClient } from '@/lib/safe-action';
import {
  createChallengeSchema,
  submitActionSchema,
  challengeKeys,
  type ActionResult,
  type ChallengeWithStatus,
  type SubmissionWithRelations,
} from '@/data/challenge/types';
import {
  createChallenge as createChallengeService,
  submitAction as submitActionService,
  getCurrentChallenge,
  getSubmissions,
} from '@/data/challenge/service';
import { consumeCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/config/credits';
import { siteConfig } from '@/config/site';

// 获取当前挑战
export const getCurrentChallengeAction = userActionClient.action(
  async ({ ctx }): Promise<ActionResult<ChallengeWithStatus | null>> => {
    const challenge = await getCurrentChallenge(ctx.user.id);
    return { success: true, data: challenge };
  }
);

// 创建挑战
export const createChallengeAction = userActionClient
  .schema(createChallengeSchema)
  .action(
    async ({ parsedInput, ctx }): Promise<ActionResult<ChallengeWithStatus>> => {
      const challenge = await createChallengeService(ctx.user.id, parsedInput);
      revalidateTag(challengeKeys.all[0], {});
      return { success: true, data: challenge };
    }
  );

// 提交行动（含积分消耗）
export const submitActionAction = userActionClient
  .schema(submitActionSchema)
  .action(
    async ({
      parsedInput,
      ctx,
    }): Promise<
      ActionResult<{
        success: boolean;
        challenge: ChallengeWithStatus;
        submission: SubmissionWithRelations;
      }>
    > => {
      const currentChallenge = await getCurrentChallenge(ctx.user.id);
      if (!currentChallenge) {
        return { success: false, error: '没有进行中的挑战' };
      }

      // 消耗积分
      const cost = siteConfig.credits.submitCost;
      const consumeResult = await consumeCredits({
        userId: ctx.user.id,
        amount: cost,
        type: CREDIT_TRANSACTION_TYPE.SUBMIT_ACTION,
        description: '提交每日行动',
        sourceType: 'SUBMISSION',
      });

      if (!consumeResult.success) {
        return { success: false, error: consumeResult.error || '积分不足' };
      }

      try {
        const result = await submitActionService(
          ctx.user.id,
          currentChallenge.id,
          parsedInput
        );
        revalidateTag(challengeKeys.all[0], {});
        revalidateTag('credits', {});
        return { success: true, data: result };
      } catch (error) {
        // 提交失败，回滚积分（简化处理：MVP 阶段先记录错误）
        // 生产环境应该用事务保证原子性
        return {
          success: false,
          error: error instanceof Error ? error.message : '提交失败',
        };
      }
    }
  );

// 获取提交记录
export const getSubmissionsAction = userActionClient
  .schema(
    z.object({
      challengeId: z.string(),
      limit: z.number().int().positive().optional(),
    })
  )
  .action(
    async ({
      parsedInput,
      ctx,
    }): Promise<ActionResult<SubmissionWithRelations[]>> => {
      const submissions = await getSubmissions(
        parsedInput.challengeId,
        parsedInput.limit
      );
      return { success: true, data: submissions };
    }
  );
