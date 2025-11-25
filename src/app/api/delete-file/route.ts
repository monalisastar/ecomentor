import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // must be service role key!
)

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json()
    if (!filePath) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 })
    }

    const { error } = await supabase.storage.from('eco-mentor-assets').remove([filePath])
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('🧨 Supabase delete error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
