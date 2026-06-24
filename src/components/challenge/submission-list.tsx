'use client';

import { useSubmissions } from '@/hooks/use-challenge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface SubmissionListProps {
  challengeId: string;
  limit?: number;
}

export function SubmissionList({ challengeId, limit = 3 }: SubmissionListProps) {
  const { data: submissions, isLoading } = useSubmissions(challengeId, limit);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-[#888] mb-3">最近提交</h3>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-[#111] border border-[#1a1a1a] rounded-xl p-4 animate-pulse"
          >
            <div className="w-12 h-4 bg-[#1a1a1a] rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
              <div className="h-3 bg-[#1a1a1a] rounded w-1/4" />
            </div>
            <div className="w-16 h-4 bg-[#1a1a1a] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[#888] mb-3">最近提交</h3>
        <div className="text-center py-8 text-[#666] text-sm bg-[#111] border border-[#1a1a1a] rounded-xl">
          还没有提交记录。开始行动吧。
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-[#888] mb-3">最近提交</h3>
      {submissions.slice(0, limit).map((sub) => (
        <div
          key={sub.id}
          className="flex items-center gap-4 bg-[#111] border border-[#1a1a1a] rounded-xl p-4"
        >
          <div className="text-sm font-bold text-[#666] min-w-[50px]">
            Day {sub.day}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#888] truncate">{sub.action}</div>
            <div className="text-xs text-[#666] mt-0.5">
              {formatRelativeTime(sub.createdAt)}
            </div>
          </div>
          <div className="text-sm font-bold text-[#00ff88]">
            +{formatCurrency(sub.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
