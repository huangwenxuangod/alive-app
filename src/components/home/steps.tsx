"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    num: "1",
    title: "选目标",
    desc: "$1 / $10 / $100 / $1000，选一个你能达到的目标",
  },
  {
    num: "2",
    title: "30天倒计时",
    desc: "系统开启30天生存倒计时，每天提交行动和收入",
  },
  {
    num: "3",
    title: "活着或死亡",
    desc: "达到目标=活着。没达到=公开死亡，进入墓地",
  },
];

export function Steps() {
  return (
    <section className="py-20">
      <h2 className="text-[28px] font-bold mb-8">怎么玩</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-[#888]">{step.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
