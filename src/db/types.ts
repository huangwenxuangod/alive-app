import {
  account,
  challenge,
  creditAccount,
  creditBatch,
  creditTransaction,
  session,
  submission,
  user,
  verification,
} from './schema';

// ─── Auth ─────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// ─── Challenge ────────────────────────────────────────────────

export type Challenge = typeof challenge.$inferSelect;
export type NewChallenge = typeof challenge.$inferInsert;

// ─── Submission ───────────────────────────────────────────────

export type Submission = typeof submission.$inferSelect;
export type NewSubmission = typeof submission.$inferInsert;

// ─── Credits ──────────────────────────────────────────────────

export type CreditAccount = typeof creditAccount.$inferSelect;
export type NewCreditAccount = typeof creditAccount.$inferInsert;

export type CreditBatch = typeof creditBatch.$inferSelect;
export type NewCreditBatch = typeof creditBatch.$inferInsert;

export type CreditTransaction = typeof creditTransaction.$inferSelect;
export type NewCreditTransaction = typeof creditTransaction.$inferInsert;
