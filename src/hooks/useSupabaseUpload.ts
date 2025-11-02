"use client"

import { useState } from "react"

/**
 * 🧠 useSupabaseUpload — Eco-Mentor LMS
 * ------------------------------------------------------------
 * Handles client-side uploads to Supabase using signed URLs.
 * Automatically handles progress, errors, and file preview URLs.
 */
export function useSupabaseUpload() {
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  /**
   * Upload a file to Supabase Storage using signed URLs.
   * @param file File to upload
   * @param context Logical folder: "lessons", "reports", "course-images", etc.
   */
  async function uploadFile(file: File, context: string = "misc") {
    try {
      setError(null)
      setProgress(0)
      setFileUrl(null)

      // 1️⃣ Request signed upload URL from backend
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          context,
        }),
      })

      if (!res.ok) throw new Error("Failed to get upload URL")

      const { uploadUrl, publicUrl, bucket, path } = await res.json()
      if (!uploadUrl) throw new Error("Upload URL not returned")

      // 2️⃣ Upload the file directly via PUT
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed (${xhr.status})`))
        }

        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(file)
      })

      // 3️⃣ Determine final file URL
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const finalUrl =
        publicUrl ||
        `${baseUrl}/storage/v1/object/public/${bucket}/${path}`

      setFileUrl(finalUrl)

      return {
        success: true,
        url: finalUrl,
        bucket,
        path,
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err)
      setError(err.message || "Upload failed")
      return { success: false, error: err.message }
    }
  }

  return { uploadFile, progress, error, fileUrl }
}
