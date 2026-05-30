import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminProductsClient from "./admin-products-client"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/protected")
  }

  return <AdminProductsClient />
}
