"use client";

import { cn } from "@/lib/utils";

const aliveData = [
  { rank: 1, name: "黄文轩", target: 100, current: 89, daysLeft: 12, status: "alive", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 2, name: "小林", target: 1000, current: 756, daysLeft: 5, status: "alive", gradient: "from-[#f093fb] to-[#f5576c]" },
  { rank: 3, name: "Alex", target: 100, current: 67, daysLeft: 18, status: "alive", gradient: "from-[#4facfe] to-[#00f2fe]" },
  { rank: 4, name: "Sarah", target: 10, current: 8, daysLeft: 20, status: "warning", gradient: "from-[#43e97b] to-[#38f9d7]" },
  { rank: 5, name: "Mike", target: 1000, current: 234, daysLeft: 3, status: "danger", gradient: "from-[#fa709a] to-[#fee140]" },
];

const revenueData = [
  { rank: 1, name: "小林", total: 2340, times: 5, rate: "80%", gradient: "from-[#f093fb] to-[#f5576c]" },
  { rank: 2, name: "黄文轩", total: 1567, times: 8, rate: "75%", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 3, name: "Mike", total: 890, times: 3, rate: "33%", gradient: "from-[#fa709a] to-[#fee140]" },
];

const firstDollarData = [
  { rank: 1, name: "Alex", day: "Day 1", target: 10, gradient: "from-[#4facfe] to-[#00f2fe]" },
  { rank: 2, name: "黄文轩", day: "Day 3", target: 100, gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 3, name: "小林", day: "Day 5", target: 1000, gradient: "from-[#f093fb] to-[#f5576c]" },
];

const survivalData = [
  { rank: 1, name: "黄文轩", longest: "45天", total: "120天", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 2, name: "Sarah", longest: "38天", total: "95天", gradient: "from-[#43e97b] to-[#38f9d7]" },
  { rank: 3, name: "小林", longest: "30天", total: "87天", gradient: "from-[#f093fb] to-[#f5576c]" },
];

const rankColors: Record<number, string> = {
  1: "text-[#ffd700]",
  2: "text-[#c0c0c0]",
  3: "text-[#cd7f32]",
};

const statusBadges: Record<string, string> = {
  alive: "bg-[rgba(0,255,136,0.15)] text-[#00ff88]",
  warning: "bg-[rgba(255,170,0,0.15)] text-[#ffaa00]",
  danger: "bg-[rgba(255,68,68,0.15)] text-[#ff4444]",
};

function UserCell({ name, gradient }: { name: string; gradient: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient}`} />
      <span className="font-semibold text-sm">{name}</span>
    </div>
  );
}

export function AliveTable() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[50px_1fr_80px_80px_80px_80px] gap-2 px-4 py-2 text-xs text-[#666] uppercase tracking-wider border-b border-[#1a1a1a]">
        <span>排名</span>
        <span>用户</span>
        <span>目标</span>
        <span>收入</span>
        <span>剩余</span>
        <span>状态</span>
      </div>
      {aliveData.map((row) => (
        <div
          key={row.rank}
          className="grid grid-cols-[50px_1fr_80px_80px_80px_80px] gap-2 items-center px-4 py-3 bg-[#111] rounded-xl text-sm"
        >
          <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>{row.rank}</span>
          <UserCell name={row.name} gradient={row.gradient} />
          <span>${row.target}</span>
          <span className="text-[#00ff88] font-semibold">${row.current}</span>
          <span>{row.daysLeft}天</span>
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold w-fit", statusBadges[row.status])}>
            {row.status === "alive" ? "活着" : row.status === "warning" ? "危险" : "濒死"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueTable() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[50px_1fr_100px_80px_80px] gap-2 px-4 py-2 text-xs text-[#666] uppercase tracking-wider border-b border-[#1a1a1a]">
        <span>排名</span>
        <span>用户</span>
        <span>总收入</span>
        <span>次数</span>
        <span>存活率</span>
      </div>
      {revenueData.map((row) => (
        <div
          key={row.rank}
          className="grid grid-cols-[50px_1fr_100px_80px_80px] gap-2 items-center px-4 py-3 bg-[#111] rounded-xl text-sm"
        >
          <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>{row.rank}</span>
          <UserCell name={row.name} gradient={row.gradient} />
          <span className="text-[#00ff88] font-semibold">${row.total}</span>
          <span>{row.times}次</span>
          <span>{row.rate}</span>
        </div>
      ))}
    </div>
  );
}

export function FirstDollarTable() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[50px_1fr_100px_80px] gap-2 px-4 py-2 text-xs text-[#666] uppercase tracking-wider border-b border-[#1a1a1a]">
        <span>排名</span>
        <span>用户</span>
        <span>用时</span>
        <span>目标</span>
      </div>
      {firstDollarData.map((row) => (
        <div
          key={row.rank}
          className="grid grid-cols-[50px_1fr_100px_80px] gap-2 items-center px-4 py-3 bg-[#111] rounded-xl text-sm"
        >
          <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>{row.rank}</span>
          <UserCell name={row.name} gradient={row.gradient} />
          <span className="text-[#00ff88] font-semibold">{row.day}</span>
          <span>${row.target}</span>
        </div>
      ))}
    </div>
  );
}

export function SurvivalTable() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[50px_1fr_100px_100px] gap-2 px-4 py-2 text-xs text-[#666] uppercase tracking-wider border-b border-[#1a1a1a]">
        <span>排名</span>
        <span>用户</span>
        <span>最长存活</span>
        <span>总存活</span>
      </div>
      {survivalData.map((row) => (
        <div
          key={row.rank}
          className="grid grid-cols-[50px_1fr_100px_100px] gap-2 items-center px-4 py-3 bg-[#111] rounded-xl text-sm"
        >
          <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>{row.rank}</span>
          <UserCell name={row.name} gradient={row.gradient} />
          <span className="text-[#00ff88] font-semibold">{row.longest}</span>
          <span>{row.total}</span>
        </div>
      ))}
    </div>
  );
}
