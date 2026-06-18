"use client";

import { useChallengeStore } from "@/stores/challenge-store";

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "刚刚";
  if (diff < 3600) return Math.floor(diff / 60) + "分钟前";
  if (diff < 86400) return Math.floor(diff / 3600) + "小时前";
  return Math.floor(diff / 86400) + "天前";
}

export function SubmissionList() {
  const submissions = useChallengeStore((s) => s.challenge?.submissions ?? []);

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-[#666] text-sm">
        还没有提交记录。开始行动吧。
      </div>
    );
  }

  const recent = [...submissions].reverse().slice(0, 3);

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-[#888] mb-3">最近提交</h3>
      {recent.map((sub, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-[#111] border border-[#1a1a1a] rounded-xl p-4"
        >
          <div className="text-sm font-bold text-[#666] min-w-[50px]">Day {sub.day}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#888] truncate">{sub.action}</div>
            <div className="text-xs text-[#666] mt-0.5">{formatTime(sub.date)}</div>
          </div>
          <div className="text-sm font-bold text-[#00ff88]">+${sub.amount}</div>
        </div>
      ))}
    </div>
  );
}
