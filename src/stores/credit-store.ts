import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CREDIT_PACKAGES, REGISTER_GIFT_CREDITS, CREDIT_TRANSACTION_TYPE } from "@/config/credits";

export type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPE)[keyof typeof CREDIT_TRANSACTION_TYPE];

export interface StoreCreditTransaction {
  id: string;
  type: CreditTransactionType;
  description: string;
  amount: number;
  remainingAmount?: number;
  createdAt: string;
  expireAt?: string;
}

interface CreditStore {
  currentCredits: number;
  transactions: StoreCreditTransaction[];
  initialized: boolean;
  init: () => void;
  addCredits: (amount: number, type: CreditTransactionType, description: string, expireDays?: number) => boolean;
  consumeCredits: (amount: number, type: CreditTransactionType, description: string) => boolean;
  getBalance: () => number;
  getTransactions: () => StoreCreditTransaction[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      currentCredits: 0,
      transactions: [],
      initialized: false,

      init: () => {
        const { initialized, transactions } = get();
        if (initialized) return;
        
        // 检查是否已有注册赠送记录
        const hasRegisterGift = transactions.some((t) => t.type === CREDIT_TRANSACTION_TYPE.REGISTER_GIFT);
        if (!hasRegisterGift) {
          const now = new Date();
          const expireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const transaction: StoreCreditTransaction = {
            id: generateId(),
            type: CREDIT_TRANSACTION_TYPE.REGISTER_GIFT,
            description: "注册赠送",
            amount: REGISTER_GIFT_CREDITS,
            remainingAmount: REGISTER_GIFT_CREDITS,
            createdAt: now.toISOString(),
            expireAt: expireAt.toISOString(),
          };
          set({
            currentCredits: REGISTER_GIFT_CREDITS,
            transactions: [transaction],
            initialized: true,
          });
        } else {
          set({ initialized: true });
        }
      },

      addCredits: (amount: number, type: CreditTransactionType, description: string, expireDays?: number) => {
        const { currentCredits, transactions } = get();
        const now = new Date();
        const expireAt = expireDays ? new Date(now.getTime() + expireDays * 24 * 60 * 60 * 1000) : undefined;
        
        const transaction: StoreCreditTransaction = {
          id: generateId(),
          type,
          description,
          amount,
          remainingAmount: amount,
          createdAt: now.toISOString(),
          expireAt: expireAt?.toISOString(),
        };

        set({
          currentCredits: currentCredits + amount,
          transactions: [...transactions, transaction],
        });
        return true;
      },

      consumeCredits: (amount: number, type: CreditTransactionType, description: string) => {
        const { currentCredits, transactions } = get();
        if (currentCredits < amount) return false;

        // FIFO: 按过期时间排序，优先消耗即将过期的
        const sorted = [...transactions]
          .filter((t) => (t.remainingAmount ?? 0) > 0 && t.type !== CREDIT_TRANSACTION_TYPE.EXPIRE)
          .sort((a, b) => {
            const aExp = a.expireAt ? new Date(a.expireAt).getTime() : Infinity;
            const bExp = b.expireAt ? new Date(b.expireAt).getTime() : Infinity;
            return aExp - bExp;
          });

        let remaining = amount;
        const updatedTransactions = transactions.map((t) => {
          if (remaining <= 0) return t;
          const match = sorted.find((s) => s.id === t.id);
          if (!match) return t;
          const available = t.remainingAmount ?? 0;
          const deduct = Math.min(available, remaining);
          remaining -= deduct;
          return { ...t, remainingAmount: available - deduct };
        });

        const usageTransaction: StoreCreditTransaction = {
          id: generateId(),
          type,
          description,
          amount: -amount,
          createdAt: new Date().toISOString(),
        };

        set({
          currentCredits: currentCredits - amount,
          transactions: [...updatedTransactions, usageTransaction],
        });
        return true;
      },

      getBalance: () => get().currentCredits,
      getTransactions: () => get().transactions,
    }),
    { name: "alive-credits" }
  )
);
