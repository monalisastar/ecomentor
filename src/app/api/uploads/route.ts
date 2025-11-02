import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { randomUUID } from "crypto"
import path from "path"
import type { NextRequest } from "next/server"

// ✅ Allow up to 25 MB per upload
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
}

/**
 * 📤 POST /api/upload  — Eco-Mentor LMS
 * ------------------------------------------------------------
 * Uploads course or lesson files directly to Supabase Storage.
 * Organized by file type:
 *  - Images → public-assets/courses
 *  - Lesson content → private-uploads/lessons
 *  - Reports/certificates → private-uploads/reports
 * 
 * 🧠 Uses streaming instead of full in-memory buffering.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const context = (formData.get("context") as string) || "misc"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const isImage = file.type.startsWith("image/")
    const bucket = isImage ? "public-assets" : "private-uploads"
    const ext = path.extname(file.name) || ".dat"
    const fileName = `${randomUUID()}${ext}`

    // 🧠 Context-based folder selection
    let folder = "misc"
    if (isImage) folder = "courses"
    else if (context === "lesson") folder = "lessons"
    else if (context === "report" || context === "certificate") folder = "reports"

    const filePath = `${folder}/${fileName}`

    // ♻️ Stream file chunks instead of loading entire buffer
    const stream = file.stream()
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    // 📦 Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 🌍 Generate appropriate URL
    let fileUrl: string
    if (isImage) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      fileUrl = data.publicUrl
    } else {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60 * 24) // valid for 24 hours
      if (error) throw error
      fileUrl = data.signedUrl
    }

    return NextResponse.json(
      { success: true, url: fileUrl, bucket, path: filePath },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Upload failed:", error)
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    )
  }
}
