"use client";

import { useState } from "react";
import { useChallengeStore } from "@/stores/challenge-store";
import { useCreditStore } from "@/stores/credit-store";
import { CreateForm } from "@/components/challenge/create-form";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import { SubmitModal } from "@/components/challenge/submit-modal";
import { SubmissionList } from "@/components/challenge/submission-list";
import { AiSuggest } from "@/components/challenge/ai-suggest";
import { CreditBalance } from "@/components/credits/credit-balance";
import { SHARE_REWARD } from "@/config/credits";
import { Share2 } from "lucide-react";

export default function ChallengePage() {
  const challenge = useChallengeStore((s) => s.challenge);
  const [modalOpen, setModalOpen] = useState(false);
  const addCredits = useCreditStore((s) => s.addCredits);

  const handleShare = () => {
    if (!challenge) return;
    const text = `Day ${challenge.day} / ${challenge.maxDays}\n$${challenge.current} / $${challenge.target}\nStatus: ${challenge.status === "alive" ? "活着" : challenge.status}\n\nTalk is cheap. Show me your money.`;
    navigator.clipboard?.writeText(text).then(() => {
      addCredits(SHARE_REWARD, "SHARE_REWARD", "分享战报奖励");
      alert("战报已复制到剪贴板，获得 1 积分奖励");
    });
  };

  return (
    <div className="py-10">
      {!challenge ? (
        <CreateForm />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[28px] font-bold">我的挑战</h2>
            <CreditBalance />
          </div>
          <ChallengeCard />
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 py-3 bg-white text-black rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02]"
            >
              提交今日行动
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-sm font-semibold text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Share2 size={16} />
              分享战报
            </button>
          </div>
          <SubmissionList />
          <div className="mt-10">
            <AiSuggest />
          </div>
        </>
      )}
      <SubmitModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
