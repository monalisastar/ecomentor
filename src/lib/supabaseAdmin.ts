import { createClient } from "@supabase/supabase-js"

// 🚨 Use the SERVICE ROLE key (full privileges) — only on the server
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅ service role key
  { auth: { persistSession: false } }
)
