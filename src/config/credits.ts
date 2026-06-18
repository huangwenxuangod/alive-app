export interface CreditPackage {
  id: string;
  amount: number;
  price: number;
  currency: string;
  popular?: boolean;
  expireDays?: number;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "basic", amount: 50, price: 4.9, currency: "$", expireDays: 30 },
  { id: "standard", amount: 120, price: 9.9, currency: "$", popular: true, expireDays: 30 },
  { id: "premium", amount: 300, price: 19.9, currency: "$", expireDays: 30 },
];

export const REGISTER_GIFT_CREDITS = 10;
export const SUBMIT_COST = 1;
export const AI_SUGGEST_COST = 2;
export const SHARE_REWARD = 1;

export const CREDIT_TRANSACTION_TYPE = {
  REGISTER_GIFT: "REGISTER_GIFT",
  PURCHASE: "PURCHASE",
  SUBMIT_ACTION: "SUBMIT_ACTION",
  AI_SUGGEST: "AI_SUGGEST",
  SHARE_REWARD: "SHARE_REWARD",
  EXPIRE: "EXPIRE",
} as const;
