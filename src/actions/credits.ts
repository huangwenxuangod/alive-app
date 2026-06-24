'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { userActionClient } from '@/lib/safe-action';
import { getCreditBalance, getTransactions } from '@/credits/credits';
import { creditsKeys } from '@/credits/types';

// 获取积分余额
export const getCreditBalanceAction = userActionClient
  .action(async ({ ctx }) => {
    const balance = await getCreditBalance(ctx.user.id);
    revalidateTag(creditsKeys.all[0], {});
    return { success: true, data: balance };
  });

// 获取交易记录
export const getTransactionsAction = userActionClient
  .schema(z.object({ limit: z.number().int().positive().optional() }))
  .action(async ({ parsedInput, ctx }) => {
    const transactions = await getTransactions(ctx.user.id, parsedInput.limit);
    return { success: true, data: transactions };
  });
