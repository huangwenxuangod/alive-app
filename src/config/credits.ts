import { siteConfig } from './site';

export const {
  REGISTER_GIFT_CREDITS,
  SUBMIT_COST,
  AI_SUGGEST_COST,
  SHARE_REWARD,
} = {
  REGISTER_GIFT_CREDITS: siteConfig.credits.registerGift,
  SUBMIT_COST: siteConfig.credits.submitCost,
  AI_SUGGEST_COST: siteConfig.credits.aiSuggestCost,
  SHARE_REWARD: siteConfig.credits.shareReward,
};

export const CREDIT_TRANSACTION_TYPE = {
  REGISTER_GIFT: 'REGISTER_GIFT',
  PURCHASE: 'PURCHASE',
  SUBMIT_ACTION: 'SUBMIT_ACTION',
  AI_SUGGEST: 'AI_SUGGEST',
  SHARE_REWARD: 'SHARE_REWARD',
  EXPIRE: 'EXPIRE',
} as const;

export type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPE)[keyof typeof CREDIT_TRANSACTION_TYPE];

export const CREDIT_PACKAGES = [
  { id: 'basic', amount: 50, price: 4.9, currency: 'USD', expireDays: 30 },
  {
    id: 'popular',
    amount: 120,
    price: 9.9,
    currency: 'USD',
    popular: true,
    expireDays: 30,
  },
  { id: 'pro', amount: 300, price: 19.9, currency: 'USD', expireDays: 30 },
];
