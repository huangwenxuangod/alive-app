export type CreditTransactionType = 
  | "REGISTER_GIFT" 
  | "PURCHASE" 
  | "SUBMIT_ACTION" 
  | "AI_SUGGEST" 
  | "SHARE_REWARD" 
  | "EXPIRE";

export interface CreditTransaction {
  id: string;
  type: CreditTransactionType;
  description: string;
  amount: number;
  remainingAmount?: number;
  createdAt: string;
  expireAt?: string;
}

export interface UserCredit {
  currentCredits: number;
  transactions: CreditTransaction[];
}
