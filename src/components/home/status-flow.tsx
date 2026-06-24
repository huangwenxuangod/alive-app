"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const statuses = [
  { name: "活着", desc: "正常挑战", color: "#00ff88", glow: true },
  { name: "危险", desc: "连续2天未提交", color: "#ffaa00", glow: true },
  { name: "濒死", desc: "连续3天未提交", color: "#ff4444", glow: true },
  { name: "死亡", desc: "挑战失败", color: "#444", glow: false },
];

export function StatusFlow() {
  return (
    <section className="py-20">
      <h2 className="text-[28px] font-bold mb-8">状态系统</h2>
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {statuses.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4 md:gap-0 w-full md:w-auto">
                <div className="flex-1 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="w-5 h-5 rounded-full mx-auto mb-2"
                    style={{
                      background: s.color,
                      boxShadow: s.glow ? `0 0 12px ${s.color}66` : "none",
                    }}
                  />
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-[#666]">{s.desc}</div>
                </div>
                {i < statuses.length - 1 && (
                  <div className="hidden md:block text-[#444] text-xl px-4">→</div>
                )}
                {i < statuses.length - 1 && (
                  <div className="md:hidden text-[#444] text-xl text-center w-full py-2">↓</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
