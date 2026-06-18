"use client";

import { useCreditStore } from "@/stores/credit-store";
import { AI_SUGGEST_COST } from "@/config/credits";
import { Sparkles } from "lucide-react";

export function AiSuggest() {
  const currentCredits = useCreditStore((s) => s.currentCredits);

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[#888]" />
        <span className="text-sm font-semibold text-[#888]">AI 续命建议</span>
        <span className="text-xs text-[#666] ml-auto">消耗 {AI_SUGGEST_COST} 积分</span>
      </div>
      <div className="text-sm text-[#888] space-y-2">
        <p>你已连续5天没有收入。</p>
        <p>
          <strong className="text-white">建议：</strong>今天直接私聊20位潜在用户。不要继续优化产品页面。
        </p>
      </div>
      <div className="mt-4 space-y-2">
        {["列出20个潜在用户名单", "准备一条简洁的私信模板", "今天发出至少10条"].map((task) => (
          <div key={task} className="flex items-center gap-2 text-sm text-[#888]">
            <span className="text-[#00ff88]">✓</span>
            {task}
          </div>
        ))}
      </div>
      {currentCredits < AI_SUGGEST_COST && (
        <div className="mt-4 text-xs text-[#ff4444]">
          积分不足，需要 {AI_SUGGEST_COST} 积分
        </div>
      )}
    </div>
  );
}
