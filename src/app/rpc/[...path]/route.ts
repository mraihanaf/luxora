import { RPCHandler } from "@orpc/server/fetch"
import { NextResponse, type NextRequest } from "next/server"
import { router } from "@/routers"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const handler = new RPCHandler(router)

async function handle(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await handler.handle(request, {
    prefix: "/rpc",
    context: {
      user: user ?? undefined,
    },
  })

  if (!result.matched) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  return result.response
}

export async function POST(request: NextRequest) {
  return handle(request)
}

export async function GET(request: NextRequest) {
  return handle(request)
}
