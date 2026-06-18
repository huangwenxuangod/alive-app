"use client";

import { useState } from "react";
import { useChallengeStore } from "@/stores/challenge-store";
import { useCreditStore } from "@/stores/credit-store";
import { CreditBalance } from "@/components/credits/credit-balance";

const targets = [
  { value: 1, label: "$1", desc: "先赚到第一块钱" },
  { value: 10, label: "$10", desc: "一杯咖啡钱" },
  { value: 100, label: "$100", desc: "小试牛刀" },
  { value: 1000, label: "$1000", desc: "serious 模式" },
];

export function CreateForm() {
  const [selected, setSelected] = useState(100);
  const [nickname, setNickname] = useState("");
  const createChallenge = useChallengeStore((s) => s.createChallenge);

  const handleStart = () => {
    const name = nickname.trim() || "挑战者";
    createChallenge(name, selected);
  };

  return (
    <div className="max-w-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-bold">创建你的生存挑战</h2>
        <CreditBalance />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-[#888] font-semibold mb-3">选择目标金额</label>
        <div className="grid grid-cols-2 gap-3">
          {targets.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`p-5 bg-[#111] border-2 rounded-xl text-center cursor-pointer transition-all ${
                selected === t.value
                  ? "border-[#00ff88] bg-[rgba(0,255,136,0.05)]"
                  : "border-[#1a1a1a] hover:border-[#333]"
              }`}
            >
              <div className="text-[28px] font-extrabold">{t.label}</div>
              <div className="text-xs text-[#666] mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-[#888] font-semibold mb-3">挑战周期</label>
        <div className="p-4 bg-[#111] border border-[#1a1a1a] rounded-lg text-lg font-semibold">
          30 天
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-[#888] font-semibold mb-3">你的昵称</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="输入你的昵称"
          className="w-full px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-white text-sm outline-none focus:border-[#333] transition-colors"
        />
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-white text-black py-4 rounded-lg text-lg font-bold transition-transform hover:scale-[1.02]"
      >
        开始生存
      </button>
    </div>
  );
}
