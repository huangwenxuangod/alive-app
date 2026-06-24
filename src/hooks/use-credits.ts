'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCreditBalanceAction, getTransactionsAction } from '@/actions/credits';
import { shareRewardAction } from '@/actions/share';
import { creditsKeys } from '@/credits/types';
import { toast } from 'sonner';

// 查询：积分余额
export function useCreditBalance() {
  return useQuery({
    queryKey: creditsKeys.balance('current'),
    queryFn: async () => {
      const result = await getCreditBalanceAction();
      const data = result.data as any;
      // 未授权（未登录）时返回 0，不抛错
      if (!data?.success) {
        if (data?.error === 'Unauthorized') {
          return 0;
        }
        throw new Error(data?.error || '获取积分失败');
      }
      return data.data as number;
    },
  });
}

// 查询：交易记录
export function useCreditTransactions(limit?: number) {
  return useQuery({
    queryKey: creditsKeys.transactions('current'),
    queryFn: async () => {
      const result = await getTransactionsAction({ limit });
      const data = result.data as any;
      if (!data?.success) {
        throw new Error(data?.error || '获取交易记录失败');
      }
      return data.data;
    },
    enabled: false, // 默认不加载，需要时手动触发
  });
}

// Mutation：分享奖励
export function useShareReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) =>
      shareRewardAction({ challengeId }),
    onSuccess: (result) => {
      const data = result.data as any;
      if (data?.success) {
        if (data.data?.rewarded) {
          toast.success('分享成功，获得 1 积分奖励');
        }
      } else {
        toast.error(data?.error || '分享奖励领取失败');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: creditsKeys.all });
    },
  });
}
