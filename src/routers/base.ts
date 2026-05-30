import { os as orpcOs, ORPCError } from "@orpc/server"
import { type User } from "@supabase/supabase-js"

export interface ORPCContext {
  user?: User
}

export const os = orpcOs.$context<ORPCContext>()

export const authedMiddleware = os.middleware(async ({ next, context }) => {
  if (!context.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    context: {
      user: context.user,
    },
  })
})

export const adminMiddleware = os.middleware(async ({ next, context }) => {
  if (!context.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'You must be logged in to access this resource',
    })
  }

  if (context.user.app_metadata?.role !== 'admin') {
    throw new ORPCError('FORBIDDEN', {
      message: 'Admin access required',
    })
  }

  return next({
    context: {
      user: context.user,
    },
  })
})
