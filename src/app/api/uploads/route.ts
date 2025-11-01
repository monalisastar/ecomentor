import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { randomUUID } from "crypto"
import path from "path"
import type { NextRequest } from "next/server"

/**
 * 📤 POST /api/upload  — Eco-Mentor LMS
 * ------------------------------------------------------------
 * Uploads course or lesson files directly to Supabase Storage.
 * Organized by file type:
 *  - Images → public-assets/courses
 *  - Lesson content → private-uploads/lessons
 *  - Reports/certificates → private-uploads/reports
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
    if (isImage) {
      folder = "courses"
    } else if (context === "lesson") {
      folder = "lessons"
    } else if (context === "report" || context === "certificate") {
      folder = "reports"
    }

    const filePath = `${folder}/${fileName}`

    // 🧩 Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 📦 Upload to Supabase
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
        .createSignedUrl(filePath, 60 * 60 * 24) // 24 hours
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
