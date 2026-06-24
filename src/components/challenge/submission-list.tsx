'use client';

import { useState } from 'react';
import { useSubmissions } from '@/hooks/use-challenge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { ImageIcon, X } from 'lucide-react';

interface SubmissionListProps {
  challengeId: string;
  limit?: number;
}

export function SubmissionList({ challengeId, limit = 3 }: SubmissionListProps) {
  const { data: submissions, isLoading } = useSubmissions(challengeId, limit);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-[#666] min-w-[50px]">
              Day {sub.day}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#ccc]">{sub.action}</div>
              <div className="text-xs text-[#666] mt-0.5">
                {formatRelativeTime(sub.createdAt)}
                {sub.note && <span className="ml-2 text-[#555]">· {sub.note}</span>}
              </div>
            </div>
            <div className="text-sm font-bold text-[#00ff88]">
              +{formatCurrency(sub.amount)}
            </div>
          </div>

          {/* 截图缩略图 */}
          {sub.screenshotData && (
            <div className="mt-3 ml-[66px]">
              <button
                type="button"
                onClick={() => setPreviewImage(sub.screenshotData!)}
                className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#222] hover:border-[#00ff88]/30 transition-colors"
              >
                <ImageIcon size={14} className="text-[#666] group-hover:text-[#00ff88]" />
                <span className="text-xs text-[#888] group-hover:text-[#00ff88]">查看截图</span>
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 图片预览 Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="截图"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
