'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  getCurrentChallengeAction,
  createChallengeAction,
  submitActionAction,
  getSubmissionsAction,
} from '@/actions/challenge';
import { getAiSuggestAction, type AiSuggestion } from '@/actions/ai-suggest';
import {
  challengeKeys,
  type CreateChallengeInput,
  type SubmitActionInput,
  type ChallengeWithStatus,
  type SubmissionWithRelations,
} from '@/data/challenge/types';
import { toast } from 'sonner';

// 查询：当前挑战
export function useCurrentChallenge(): UseQueryResult<
  ChallengeWithStatus | null,
  Error
> {
  return useQuery({
    queryKey: challengeKeys.current(),
    queryFn: async () => {
      const result = await getCurrentChallengeAction();
      // 未授权（未登录）时返回 null，不抛错
      if (!result.data?.success) {
        if (result.data?.error === 'Unauthorized') {
          return null;
        }
        throw new Error(result.data?.error || '获取挑战失败');
      }
      return result.data.data;
    },
  });
}

// 查询：提交记录
export function useSubmissions(
  challengeId: string | undefined,
  limit?: number
): UseQueryResult<SubmissionWithRelations[], Error> {
  return useQuery({
    queryKey: challengeKeys.submissions(challengeId || ''),
    queryFn: async () => {
      const result = await getSubmissionsAction({
        challengeId: challengeId!,
        limit,
      });
      if (!result.data?.success) {
        throw new Error(result.data?.error || '获取提交记录失败');
      }
      return result.data.data;
    },
    enabled: !!challengeId,
  });
}

// Mutation：创建挑战
export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChallengeInput) => createChallengeAction(input),
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success('挑战开始！');
        queryClient.invalidateQueries({ queryKey: challengeKeys.all });
      } else {
        toast.error(result.data?.error || '创建失败');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Mutation：提交行动
export function useSubmitAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitActionInput) => submitActionAction(input),

    onMutate: async (newSubmission) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: challengeKeys.current() });
      const previous = queryClient.getQueryData(challengeKeys.current());

      if (previous) {
        queryClient.setQueryData(
          challengeKeys.current(),
          (old: ChallengeWithStatus | null | undefined) => {
            if (!old) return old;
            return {
              ...old,
              current: old.current + (newSubmission.amount || 0),
            };
          }
        );
      }

      return { previous };
    },

    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success('提交成功！');
      } else {
        toast.error(result.data?.error || '提交失败');
      }
    },

    onError: (_, __, context) => {
      // 回滚乐观更新
      if (context?.previous) {
        queryClient.setQueryData(
          challengeKeys.current(),
          context.previous
        );
      }
      toast.error('提交失败');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

// Mutation：获取 AI 建议
export function useAiSuggest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getAiSuggestAction(),
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success('AI 建议已生成');
      } else {
        toast.error(result.data?.error || '获取建议失败');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

export type { AiSuggestion };
