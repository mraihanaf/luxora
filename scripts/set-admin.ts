import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const userId = process.argv[2];

if (!userId) {
  throw new Error("Usage: tsx scripts/set-admin.ts <userId>");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: "admin" },
});

if (error) {
  throw error;
}

console.log("Updated user:", data.user?.id, data.user?.app_metadata);

