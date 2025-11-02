import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin" // Secure service-role client
import { randomUUID } from "crypto"
import path from "path"

/**
 * 🧠 /api/upload-url
 * -------------------------------------------------------
 * Generates a signed Supabase upload URL (valid 1 hour)
 * Uses a single bucket: eco-mentor-assets
 * Automatically builds folder structure from context.
 */
export async function POST(req: Request) {
  try {
    const { fileName, fileType, context } = await req.json()

    // 🧩 Validate input
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file info" }, { status: 400 })
    }

    // ✅ Always use your main bucket
    const bucket = "eco-mentor-assets"

    // 🗂 Folder naming based on upload context
    let folder = "misc"
    switch (context) {
      case "course-images":
      case "instructor-profiles":
      case "lessons":
      case "videos":
      case "reports":
      case "certificates":
      case "course-import":
        folder = context
        break
      default:
        folder = "misc"
    }

    // 🪶 Build final file path
    const ext = path.extname(fileName) || ".dat"
    const randomName = `${randomUUID()}${ext}`
    const filePath = `${folder}/${randomName}`

    // 🔐 Generate signed upload URL (valid 60 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(filePath)

    if (error) throw error

    // 🌍 Public URL (your bucket is public)
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`

    // ✅ Respond with URLs
    return NextResponse.json({
      success: true,
      uploadUrl: data.signedUrl,
      bucket,
      path: filePath,
      publicUrl,
    })
  } catch (err: any) {
    console.error("❌ Signed-URL generation failed:", err)
    return NextResponse.json(
      { error: err.message || "Upload URL generation failed" },
      { status: 500 }
    )
  }
}
