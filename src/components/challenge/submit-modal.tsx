"use client";

import { useState, useRef } from "react";
import { useChallengeStore } from "@/stores/challenge-store";
import { useCreditStore } from "@/stores/credit-store";
import { SUBMIT_COST } from "@/config/credits";
import { X, Plus } from "lucide-react";

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubmitModal({ open, onClose }: SubmitModalProps) {
  const [action, setAction] = useState("");
  const [amount, setAmount] = useState("0");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const submitAction = useChallengeStore((s) => s.submitAction);
  const consumeCredits = useCreditStore((s) => s.consumeCredits);
  const currentCredits = useCreditStore((s) => s.currentCredits);

  if (!open) return null;

  const handleSubmit = () => {
    if (!action.trim()) {
      alert("请描述你今天做了什么");
      return;
    }
    if (currentCredits < SUBMIT_COST) {
      alert(`积分不足。提交需要 ${SUBMIT_COST} 积分，当前 ${currentCredits} 积分`);
      return;
    }

    const success = consumeCredits(SUBMIT_COST, "SUBMIT_ACTION", "提交每日行动");
    if (!success) {
      alert("积分扣除失败");
      return;
    }

    submitAction(action.trim(), parseFloat(amount) || 0);
    setAction("");
    setAmount("0");
    setFileName("");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <h3 className="text-lg font-semibold">提交今日行动</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-[#666] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-[#888] font-semibold mb-2">今天做了什么</label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="描述你今天为赚钱做了什么..."
              className="w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-white text-sm outline-none focus:border-[#333] transition-colors min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-[#888] font-semibold mb-2">收入金额 ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-white text-sm outline-none focus:border-[#333] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#888] font-semibold mb-2">收入截图</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                fileName ? "border-[#00ff88]" : "border-[#1a1a1a] hover:border-[#333]"
              }`}
            >
              <div className="text-2xl mb-2">{fileName ? "✓" : "+"}</div>
              <div className="text-sm text-[#888]">{fileName || "点击上传截图"}</div>
              <div className="text-xs text-[#666] mt-1">支持 Stripe、PayPal、微信、支付宝等</div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#888] font-semibold mb-2">备注</label>
            <input
              type="text"
              placeholder="可选"
              className="w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-white text-sm outline-none focus:border-[#333] transition-colors"
            />
          </div>

          <div className="text-xs text-[#666]">
            提交消耗 {SUBMIT_COST} 积分，当前余额: {currentCredits} 积分
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[#1a1a1a]">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-sm font-semibold text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-white text-black rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02]"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
