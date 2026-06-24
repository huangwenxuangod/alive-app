import type { CreditAccount, CreditTransaction, CreditBatch } from '@/db/types';

export type { CreditAccount, CreditTransaction, CreditBatch };

export type CreditDirection = 'IN' | 'OUT';

export interface CreditStats {
  currentCredits: number;
  totalEarned: number;
  totalConsumed: number;
  totalExpired: number;
}

// ====== Query Keys ======
// 注意：放在这里而不是 actions/credits.ts，因为客户端也需要使用
// Server Action 文件中的非 action 导出在客户端不可用

export const creditsKeys = {
  all: ['credits'] as const,
  balance: (userId: string) => [...creditsKeys.all, 'balance', userId] as const,
  transactions: (userId: string) => [...creditsKeys.all, 'transactions', userId] as const,
};
