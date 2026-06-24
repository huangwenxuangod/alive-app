'use client';

import { useCreditBalance } from '@/hooks/use-credits';
import { Coins } from 'lucide-react';

export function CreditBalance() {
  const { data: credits, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <Coins size={16} className="text-[#00ff88]" />
        <div className="w-6 h-4 bg-[#1a1a1a] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-[#00ff88] font-semibold">
      <Coins size={16} />
      <span>{credits ?? 0}</span>
    </div>
  );
}
