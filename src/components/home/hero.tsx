"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const ctaHref = isLoggedIn ? "/challenge" : "/auth/login";

  return (
    <section className="text-center py-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-[96px] font-black tracking-[-4px] text-white leading-none"
      >
        活着
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-base text-[#666] mt-3"
      >
        ALIVE — 30天赚钱生存挑战
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-[#666] italic mt-2"
      >
        Talk is cheap. Show me your money.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center gap-12 mt-10 mb-10"
      >
        <div className="text-center">
          <div className="text-5xl font-extrabold text-[#00ff88]">127</div>
          <div className="text-sm text-[#666] mt-1">Alive 活着</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-extrabold text-[#ff4444]">9</div>
          <div className="text-sm text-[#666] mt-1">Dead 死亡</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-extrabold text-white">$2,871</div>
          <div className="text-sm text-[#666] mt-1">今日收入</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link href={ctaHref}>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 px-12 py-4 text-lg font-bold">
            开始挑战
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
