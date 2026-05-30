import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VideoTestClient from "./video-test-client"

export default async function VideoTestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/protected/video-test")
  }

  return <VideoTestClient />
}
