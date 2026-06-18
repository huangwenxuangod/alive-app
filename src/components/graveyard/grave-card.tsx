"use client";

interface GraveCardProps {
  name: string;
  date: string;
  target: number;
  final: number;
  day: string;
  epitaph: string;
  gradient: string;
}

export function GraveCard({ name, date, target, final, day, epitaph, gradient }: GraveCardProps) {
  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 transition-all hover:border-[#ff4444] hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient}`} />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-[#ff4444]">{date} 死亡</div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#666]">目标</span>
          <span className="font-semibold">${target}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#666]">最终</span>
          <span className="font-semibold text-[#ff4444]">${final}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#666]">止步</span>
          <span className="font-semibold">{day}</span>
        </div>
      </div>
      <div className="text-xs text-[#666] italic pt-4 border-t border-[#1a1a1a]">{epitaph}</div>
    </div>
  );
}
