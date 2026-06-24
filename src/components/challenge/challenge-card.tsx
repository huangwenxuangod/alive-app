'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { statusTextMap, statusBadgeMap } from '@/utils/status-machine';
import type { ChallengeWithStatus } from '@/data/challenge/types';

interface ChallengeCardProps {
  challenge: ChallengeWithStatus;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const statusText = statusTextMap[challenge.status];
  const badgeVariant = statusBadgeMap[challenge.status];

  // 根据状态映射 Progress variant
  const progressVariant =
    challenge.status === 'warning'
      ? 'warning'
      : challenge.status === 'danger' || challenge.status === 'dead'
      ? 'danger'
      : 'default';

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
        <div>
          <div className="text-lg font-semibold">{challenge.name}</div>
          <Badge variant={badgeVariant}>{statusText}</Badge>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm text-[#888] mb-2">
          <span>
            Day {challenge.day} / {challenge.maxDays}
          </span>
          <span>
            {formatCurrency(challenge.current)} / {formatCurrency(challenge.target)}
          </span>
        </div>
        <Progress value={challenge.progress} variant={progressVariant} />
        <div className="flex justify-between text-xs text-[#666] mt-2">
          <span>剩余 {challenge.daysLeft} 天</span>
          <span>还需 {formatCurrency(challenge.revenueLeft)}</span>
        </div>
      </div>
    </div>
  );
}
