"use client";

const analyses = [
  { title: "未开始行动", count: 3, desc: "报名后从未提交过任何行动" },
  { title: "中途放弃", count: 4, desc: "连续多天未提交，进入濒死状态后放弃" },
  { title: "差一点点", count: 2, desc: "坚持到第30天，但未达到目标金额" },
];

export function DeathAnalysis() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {analyses.map((a) => (
        <div key={a.title} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 text-center">
          <div className="text-sm mb-2">{a.title}</div>
          <div className="text-[32px] font-extrabold text-[#ff4444] mb-2">{a.count}人</div>
          <div className="text-xs text-[#666]">{a.desc}</div>
        </div>
      ))}
    </div>
  );
}
