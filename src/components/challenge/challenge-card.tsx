"use client";

import { useChallengeStore } from "@/stores/challenge-store";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { text: string; cls: string }> = {
  alive: { text: "活着", cls: "bg-[rgba(0,255,136,0.15)] text-[#00ff88]" },
  warning: { text: "危险", cls: "bg-[rgba(255,170,0,0.15)] text-[#ffaa00]" },
  danger: { text: "濒死", cls: "bg-[rgba(255,68,68,0.15)] text-[#ff4444]" },
  dead: { text: "死亡", cls: "bg-[rgba(68,68,68,0.3)] text-[#666]" },
};

export function ChallengeCard() {
  const challenge = useChallengeStore((s) => s.challenge);
  const getProgress = useChallengeStore((s) => s.getProgress);
  const getDaysLeft = useChallengeStore((s) => s.getDaysLeft);
  const getRevenueLeft = useChallengeStore((s) => s.getRevenueLeft);

  if (!challenge) return null;

  const progress = getProgress();
  const daysLeft = getDaysLeft();
  const revenueLeft = getRevenueLeft();
  const status = statusMap[challenge.status] || statusMap.alive;

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
        <div>
          <div className="text-lg font-semibold">{challenge.name}</div>
          <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold", status.cls)}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm text-[#888] mb-2">
          <span>
            Day {challenge.day} / {challenge.maxDays}
          </span>
          <span>
            ${challenge.current} / ${challenge.target}
          </span>
        </div>
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                challenge.status === "warning"
                  ? "#ffaa00"
                  : challenge.status === "danger"
                  ? "#ff4444"
                  : "linear-gradient(90deg, #00ff88, #00cc6a)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#666] mt-2">
          <span>剩余 {daysLeft} 天</span>
          <span>还需 ${revenueLeft}</span>
        </div>
      </div>
    </div>
  );
}
