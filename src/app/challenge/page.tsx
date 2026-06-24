import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { getSession } from '@/lib/server';
import { getCurrentChallenge } from '@/data/challenge/service';
import { challengeKeys } from '@/data/challenge/types';
import { ChallengeClient } from './challenge-client';

// 用户特定的动态页面，不需要静态预渲染
export const dynamic = 'force-dynamic';

export default async function ChallengePage() {
  const session = await getSession();
  const queryClient = new QueryClient();

  // 已登录用户预取挑战数据
  if (session?.user) {
    await queryClient.prefetchQuery({
      queryKey: challengeKeys.current(),
      queryFn: () => getCurrentChallenge(session.user.id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChallengeClient />
    </HydrationBoundary>
  );
}
