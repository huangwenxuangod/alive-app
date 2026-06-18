"use client";

import { useEffect } from "react";
import { useCreditStore } from "@/stores/credit-store";
import { Coins } from "lucide-react";

export function CreditBalance() {
  const { currentCredits, init } = useCreditStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-[#00ff88] font-semibold">
      <Coins size={16} />
      <span>{currentCredits}</span>
    </div>
  );
}
