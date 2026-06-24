import { getAuth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';

/**
 * 惰性初始化的 auth handlers
 *
 * Better Auth 的 toNextJsHandler 需要 auth 实例，
 * 但我们的 auth 是惰性初始化的（第一次使用时才连接数据库）。
 * 这里在第一次请求时才初始化 auth 和 handlers。
 */
let handlersCache: any = null;

async function getHandlers() {
  if (handlersCache) return handlersCache;
  const auth = await getAuth();
  handlersCache = toNextJsHandler(auth);
  return handlersCache;
}

export async function GET(req: NextRequest) {
  const handlers = await getHandlers();
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const handlers = await getHandlers();
  return handlers.POST(req);
}
