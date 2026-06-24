"use client";

import { cn } from "@/lib/utils";

export type LeaderboardTab = "alive" | "revenue" | "first" | "survival";

const tabs: { id: LeaderboardTab; label: string }[] = [
  { id: "alive", label: "活人榜" },
  { id: "revenue", label: "收入榜" },
  { id: "first", label: "第一刀榜" },
  { id: "survival", label: "存活榜" },
];

interface LeaderboardTabsProps {
  active: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}

export function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
            active === tab.id
              ? "bg-white text-black"
              : "bg-[#111] border border-[#1a1a1a] text-[#888] hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
