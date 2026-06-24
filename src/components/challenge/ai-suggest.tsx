'use client';

import { useState } from 'react';
import { useAiSuggest, type AiSuggestion } from '@/hooks/use-challenge';
import { useCreditBalance } from '@/hooks/use-credits';
import { Button } from '@/components/ui/button';
import { AI_SUGGEST_COST } from '@/config/credits';
import { Sparkles, AlertTriangle } from 'lucide-react';

export function AiSuggest() {
  const { data: credits } = useCreditBalance();
  const { mutate: getSuggestion, isPending } = useAiSuggest();
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);

  const creditsInsufficient = credits !== undefined && credits < AI_SUGGEST_COST;

  const handleGetSuggestion = () => {
    getSuggestion(undefined, {
      onSuccess: (result) => {
        if (result.data?.success && result.data.data) {
          setSuggestion(result.data.data);
        }
      },
    });
  };

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[#888]" />
        <span className="text-sm font-semibold text-[#888]">AI 续命建议</span>
        <span className="text-xs text-[#666] ml-auto">
          消耗 {AI_SUGGEST_COST} 积分
        </span>
      </div>

      {suggestion ? (
        <div className="text-sm text-[#888] space-y-3">
          <p>{suggestion.analysis}</p>
          <p>
            <strong className="text-white">建议：</strong>
            {suggestion.suggestion}
          </p>
          <div className="mt-4 space-y-2">
            {suggestion.actionItems.map((task, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#888]">
                <span className="text-[#00ff88]">✓</span>
                {task}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-[#666] mb-4">
            基于你的挑战状态，AI 会给出个性化的续命建议和行动清单。
          </p>
          <Button
            onClick={handleGetSuggestion}
            disabled={isPending || creditsInsufficient}
            className="w-full"
            variant="secondary"
          >
            {isPending ? '生成中...' : '获取 AI 建议'}
          </Button>
        </>
      )}

      {creditsInsufficient && (
        <div className="mt-4 flex items-start gap-2 text-xs text-[#ff4444]">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>积分不足，需要 {AI_SUGGEST_COST} 积分，当前 {credits} 积分</span>
        </div>
      )}
    </div>
  );
}
