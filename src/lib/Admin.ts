import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// ⚠️ Never expose this to the client, only use in API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
