import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';
import { getAuth } from './auth';

/**
 * 获取当前会话
 *
 * 注意：不要在 middleware 中调用
 */
export const getSession = cache(async () => {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

/**
 * 要求已登录，未登录则抛出错误
 */
export const requireSession = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
});
