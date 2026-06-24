'use server';

import { revalidateTag } from 'next/cache';
import { userActionClient } from '@/lib/safe-action';
import { consumeCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/config/credits';
import { siteConfig } from '@/config/site';
import { getCurrentChallenge } from '@/data/challenge/service';

export interface AiSuggestion {
  analysis: string;
  suggestion: string;
  actionItems: string[];
}

// AI 续命建议（MVP 阶段返回 mock 数据，但真实扣减积分）
export const getAiSuggestAction = userActionClient.action(
  async ({
    ctx,
  }): Promise<{
    success: boolean;
    data?: AiSuggestion;
    error?: string;
  }> => {
    const challenge = await getCurrentChallenge(ctx.user.id);

    if (!challenge) {
      return { success: false, error: '没有进行中的挑战' };
    }

    // 消耗积分
    const consumeResult = await consumeCredits({
      userId: ctx.user.id,
      amount: siteConfig.credits.aiSuggestCost,
      type: CREDIT_TRANSACTION_TYPE.AI_SUGGEST,
      description: 'AI 续命建议',
      sourceType: 'AI_SUGGEST',
      sourceId: challenge.id,
    });

    if (!consumeResult.success) {
      return { success: false, error: consumeResult.error || '积分不足' };
    }

    revalidateTag('credits', {});

    // MVP: 返回 mock 建议
    // TODO: 接入真实 AI API
    const daysSince = challenge.daysSinceLastSubmission;
    const progress = Math.round(challenge.progress);

    const analysis =
      daysSince === 0
        ? `你今天已经提交了行动，当前进度 ${progress}%，继续保持！`
        : `你已连续 ${daysSince} 天没有收入入账，距离目标还有 ${siteConfig.challenge.maxDays - challenge.day + 1} 天，当前进度 ${progress}%。`;

    const suggestion =
      challenge.status === 'danger'
        ? '情况紧急！不要继续优化产品页面了，今天直接私聊20位潜在用户，拿到第一笔收入再说。'
        : challenge.status === 'warning'
        ? '状态告警。建议今天聚焦获客动作，而不是产品打磨。先找到10个愿意付费的人。'
        : '状态良好。建议扩大获客渠道，同时思考如何提高客单价。';

    const actionItems = [
      '列出20个潜在用户名单（朋友圈/社群/LinkedIn）',
      '准备一条简洁的私信模板（不超过3句话）',
      '今天至少发出10条私信，争取1个回复',
    ];

    return {
      success: true,
      data: {
        analysis,
        suggestion,
        actionItems,
      },
    };
  }
);
