import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Supabase connection OK ✅",
      buckets: data.map((b) => ({ name: b.name, public: b.public })),
    })
  } catch (err: any) {
    console.error("❌ Supabase connection test failed:", err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
