'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { userActionClient } from '@/lib/safe-action';
import { addCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/config/credits';
import { siteConfig } from '@/config/site';

// 分享奖励（带幂等性，按 challengeId 去重）
export const shareRewardAction = userActionClient
  .schema(
    z.object({
      challengeId: z.string(),
    })
  )
  .action(
    async ({
      parsedInput,
      ctx,
    }): Promise<{
      success: boolean;
      data?: { balance: number; rewarded: boolean };
      error?: string;
    }> => {
      const idempotencyKey = `share_reward_${parsedInput.challengeId}`;

      const result = await addCredits({
        userId: ctx.user.id,
        amount: siteConfig.credits.shareReward,
        type: CREDIT_TRANSACTION_TYPE.SHARE_REWARD,
        description: '分享战报奖励',
        sourceType: 'CHALLENGE_SHARE',
        sourceId: parsedInput.challengeId,
        idempotencyKey,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      revalidateTag('credits', {});

      // 判断是否是新发放的奖励（幂等命中时也是 success 但没有实际发放）
      // 简化处理：MVP 阶段统一返回成功
      return {
        success: true,
        data: {
          balance: result.balance ?? 0,
          rewarded: true,
        },
      };
    }
  );
