'use client';

import { useState } from 'react';
import { useCurrentChallenge } from '@/hooks/use-challenge';
import { useShareReward } from '@/hooks/use-credits';
import { useSession } from '@/lib/auth-client';
import { CreateForm } from '@/components/challenge/create-form';
import { ChallengeCard } from '@/components/challenge/challenge-card';
import { SubmitModal } from '@/components/challenge/submit-modal';
import { SubmissionList } from '@/components/challenge/submission-list';
import { AiSuggest } from '@/components/challenge/ai-suggest';
import { CreditBalance } from '@/components/credits/credit-balance';
import { Button } from '@/components/ui/button';
import { Share2, LogIn } from 'lucide-react';
import { canSubmitAction } from '@/utils/status-machine';
import { formatCurrency } from '@/lib/utils';
import { SHARE_REWARD } from '@/config/credits';

export function ChallengeClient() {
  const { data: session } = useSession();
  const { data: challenge, isLoading } = useCurrentChallenge();
  const { mutate: shareReward } = useShareReward();
  const [modalOpen, setModalOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  // 未登录状态
  if (!session?.user) {
    return (
      <div className="py-10 max-w-[500px]">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
            <LogIn size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">登录后开始挑战</h2>
          <p className="text-sm text-[#888] mb-6">
            登录后即可创建你的 30 天赚钱生存挑战，用真实收入证明你还活着。
          </p>
          <a
            href="/api/auth/signin"
            className="w-full h-12 px-6 text-base font-bold bg-[#00ff88] text-black rounded-lg flex items-center justify-center hover:bg-[#00ff88]/90 transition-colors"
          >
            立即登录
          </a>
        </div>
      </div>
    );
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-32 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-5 w-12 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a]" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-[#1a1a1a] rounded" />
              <div className="h-4 w-12 bg-[#1a1a1a] rounded" />
            </div>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full" />
        </div>
      </div>
    );
  }

  // 无挑战 → 显示创建表单
  if (!challenge) {
    return (
      <div className="py-10">
        <CreateForm />
      </div>
    );
  }

  // 有挑战 → 显示挑战详情
  const canSubmit = canSubmitAction(challenge.status);

  const handleShare = async () => {
    if (!challenge || sharing) return;

    // 前端幂等：检查 localStorage
    const shareKey = `shared_challenge_${challenge.id}`;
    if (localStorage.getItem(shareKey)) {
      // 已经分享过，只复制文本
      const text = buildShareText(challenge);
      try {
        await navigator.clipboard?.writeText(text);
        alert('战报已复制到剪贴板（今日已领取过分享奖励）');
      } catch {
        alert('战报已生成（今日已领取过分享奖励）');
      }
      return;
    }

    setSharing(true);
    const text = buildShareText(challenge);

    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // 剪贴板不可用也继续
    }

    // 调用分享奖励
    shareReward(challenge.id, {
      onSuccess: (result) => {
        if (result.data?.success) {
          localStorage.setItem(shareKey, 'true');
        }
      },
      onSettled: () => {
        setSharing(false);
      },
    });
  };

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-bold">我的挑战</h2>
        <CreditBalance />
      </div>

      <ChallengeCard challenge={challenge} />

      <div className="flex gap-3 mt-5">
        <Button
          onClick={() => setModalOpen(true)}
          disabled={!canSubmit}
          className="flex-1 h-12 text-base font-semibold"
        >
          {canSubmit ? '提交今日行动' : '挑战已结束'}
        </Button>
        <Button
          onClick={handleShare}
          variant="secondary"
          disabled={sharing}
          className="flex items-center gap-2 px-5 h-12 text-sm font-semibold"
        >
          <Share2 size={16} />
          分享战报
        </Button>
      </div>

      <SubmissionList challengeId={challenge.id} limit={3} />

      <div className="mt-10">
        <AiSuggest />
      </div>

      <SubmitModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

function buildShareText(challenge: {
  day: number;
  maxDays: number;
  current: number;
  target: number;
  status: string;
}) {
  const statusText: Record<string, string> = {
    alive: '活着',
    warning: '危险',
    danger: '濒死',
    dead: '死亡',
    victory: '胜利',
  };
  return `Day ${challenge.day} / ${challenge.maxDays}\n${formatCurrency(challenge.current)} / ${formatCurrency(challenge.target)}\n状态: ${statusText[challenge.status] || challenge.status}\n\nTalk is cheap. Show me your money.`;
}
