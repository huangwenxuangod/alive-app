"use client";

import { GraveCard, type GraveData } from "@/components/graveyard/grave-card";
import { DeathAnalysis } from "@/components/graveyard/death-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const graves: GraveData[] = [
  { name: "Jason", date: "2026.06.15", target: 100, final: 13, day: "Day 30", epitaph: "倒在了终点线前。差一点点。", gradient: "from-[#667eea] to-[#764ba2]" },
  { name: "Emma", date: "2026.06.12", target: 1000, final: 0, day: "Day 15", epitaph: "从未开始，就已经结束。", gradient: "from-[#f093fb] to-[#f5576c]" },
  { name: "David", date: "2026.06.10", target: 100, final: 67, day: "Day 30", epitaph: "努力了，但还不够。下次见。", gradient: "from-[#4facfe] to-[#00f2fe]" },
  { name: "Lisa", date: "2026.06.08", target: 10, final: 3, day: "Day 20", epitaph: "连一杯咖啡钱都没赚到。", gradient: "from-[#43e97b] to-[#38f9d7]" },
  { name: "Tom", date: "2026.06.05", target: 1, final: 0, day: "Day 7", epitaph: "一块钱，竟然这么难。", gradient: "from-[#fa709a] to-[#fee140]" },
];

export function GraveyardClient() {
  return (
    <div className="py-10">
      <Card className="mb-8">
        <CardContent className="text-center py-10">
          <h1 className="text-[36px] font-bold mb-2">墓地</h1>
          <p className="text-sm text-[#666] mb-6">这里躺着没有活到最后的勇士</p>
          <div className="flex justify-center gap-12">
            <div>
              <div className="text-[36px] font-extrabold text-[#ff4444]">9</div>
              <div className="text-xs text-[#666]">已死亡</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-[#666]">$1,247</div>
              <div className="text-xs text-[#666]">累计未达标</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {graves.map((g) => (
          <GraveCard key={g.name} {...g} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[28px] font-bold">死亡原因分析</CardTitle>
        </CardHeader>
        <CardContent>
          <DeathAnalysis />
        </CardContent>
      </Card>
    </div>
  );
}
