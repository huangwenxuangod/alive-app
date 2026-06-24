"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type FeedStatus = "alive" | "warning" | "dead";

const feedItems: {
  name: string;
  status: FeedStatus;
  statusText: string;
  time: string;
  text: string;
  gradient: string;
}[] = [
  {
    name: "黄文轩",
    status: "alive",
    statusText: "活着",
    time: "2分钟前",
    text: "Day 17 · $23 / $100 · 今天终于开了第一单",
    gradient: "from-[#667eea] to-[#764ba2]",
  },
  {
    name: "小林",
    status: "warning",
    statusText: "危险",
    time: "15分钟前",
    text: "Day 8 · $0 / $10 · 连续2天没提交，要死了",
    gradient: "from-[#f093fb] to-[#f5576c]",
  },
  {
    name: "Jason",
    status: "dead",
    statusText: "死亡",
    time: "1小时前",
    text: "最终：$13 / $100 · 倒在了第30天",
    gradient: "from-[#4facfe] to-[#00f2fe]",
  },
];

function statusVariant(status: FeedStatus): "default" | "warning" | "dead" {
  switch (status) {
    case "alive":
      return "default";
    case "warning":
      return "warning";
    case "dead":
      return "dead";
  }
}

export function Feed() {
  return (
    <section className="py-20">
      <h2 className="text-[28px] font-bold mb-8">实时动态</h2>
      <div className="flex flex-col gap-3">
        {feedItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 bg-[#111] border border-[#1a1a1a] rounded-xl p-4"
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex-shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{item.name}</span>
                <Badge variant={statusVariant(item.status)}>
                  {item.statusText}
                </Badge>
                <span className="text-xs text-[#666] ml-auto">{item.time}</span>
              </div>
              <p className="text-sm text-[#888]">{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
