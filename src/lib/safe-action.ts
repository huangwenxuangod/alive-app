import { createSafeActionClient } from 'next-safe-action';
import { getSession } from './server';

// -----------------------------------------------------------------------------
// 1. Base action client - global error handling
// -----------------------------------------------------------------------------
export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.message,
      };
    }

    return {
      success: false,
      error: 'Something went wrong while executing the action',
    };
  },
});

// -----------------------------------------------------------------------------
// 2. Auth-guarded client - injects user context, throws if not logged in
// -----------------------------------------------------------------------------
export const userActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return next({ ctx: { user: session.user } });
});
