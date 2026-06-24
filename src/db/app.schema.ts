import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

// ─── Challenge ────────────────────────────────────────────────

export const challenge = pgTable(
  'challenge',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    target: integer('target').notNull(),
    current: integer('current').notNull().default(0),
    day: integer('day').notNull().default(1),
    maxDays: integer('max_days').notNull().default(30),
    status: text('status').notNull().default('alive'),
    lastSubmissionDate: text('last_submission_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    challengeUserIdIdx: index('challenge_user_id_idx').on(table.userId),
    challengeStatusIdx: index('challenge_status_idx').on(table.status),
  })
);

// ─── Submission ───────────────────────────────────────────────

export const submission = pgTable(
  'submission',
  {
    id: text('id').primaryKey(),
    challengeId: text('challenge_id')
      .notNull()
      .references(() => challenge.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    day: integer('day').notNull(),
    action: text('action').notNull(),
    amount: integer('amount').notNull(),
    note: text('note'),
    screenshotUrl: text('screenshot_url'),
    screenshotData: text('screenshot_data'), // MVP: base64 编码图片，≤500KB
    date: text('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    submissionChallengeIdIdx: index('submission_challenge_id_idx').on(
      table.challengeId
    ),
    submissionUserIdIdx: index('submission_user_id_idx').on(table.userId),
    submissionChallengeDateIdx: uniqueIndex(
      'submission_challenge_date_idx'
    ).on(table.challengeId, table.date),
  })
);

// ─── Credit Account ───────────────────────────────────────────

export const creditAccount = pgTable(
  'credit_account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    currentCredits: integer('current_credits').notNull().default(0),
    totalEarned: integer('total_earned').notNull().default(0),
    totalConsumed: integer('total_consumed').notNull().default(0),
    totalExpired: integer('total_expired').notNull().default(0),
    version: integer('version').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    creditAccountUserIdIdx: uniqueIndex('credit_account_user_id_idx').on(
      table.userId
    ),
  })
);

// ─── Credit Batch ─────────────────────────────────────────────

export const creditBatch = pgTable(
  'credit_batch',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    batchNo: text('batch_no').notNull().unique(),
    transactionType: text('transaction_type').notNull(),
    totalAmount: integer('total_amount').notNull(),
    remainingAmount: integer('remaining_amount').notNull(),
    expireAt: timestamp('expire_at'),
    sourceId: text('source_id'),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    creditBatchUserIdExpireAtIdx: index(
      'credit_batch_user_id_expire_at_idx'
    ).on(table.userId, table.expireAt),
    creditBatchBatchNoIdx: uniqueIndex('credit_batch_batch_no_idx').on(
      table.batchNo
    ),
  })
);

// ─── Credit Transaction ───────────────────────────────────────

export const creditTransaction = pgTable(
  'credit_transaction',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    transactionNo: text('transaction_no').notNull().unique(),
    type: text('type').notNull(),
    direction: text('direction').notNull(),
    amount: integer('amount').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    batchId: text('batch_id').references(() => creditBatch.id),
    description: text('description'),
    sourceType: text('source_type'),
    sourceId: text('source_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    creditTransactionUserIdCreatedAtIdx: index(
      'credit_transaction_user_id_created_at_idx'
    ).on(table.userId, table.createdAt),
    creditTransactionTypeIdx: index('credit_transaction_type_idx').on(
      table.type
    ),
    creditTransactionTransactionNoIdx: uniqueIndex(
      'credit_transaction_transaction_no_idx'
    ).on(table.transactionNo),
  })
);
