import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import type { NextRequest } from "next/server"

/**
 * 📤 POST /api/upload
 * ------------------------------------------------------------
 * Handles course image uploads from staff dashboard.
 * Stores files in `/public/uploads` and returns a public URL.
 */
export async function POST(req: NextRequest) {
  try {
    // ⛔ Ensure the uploads folder exists
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    // 🧩 Read file buffer from request
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // ✅ Validate file type and size (limit 5MB)
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    // 📦 Save file to /public/uploads
    const fileExt = path.extname(file.name) || ".png"
    const fileName = `${randomUUID()}${fileExt}`
    const filePath = path.join(uploadDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    // 🌍 Return public URL
    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (error) {
    console.error("❌ File upload failed:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
