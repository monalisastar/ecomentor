'use client'

import { useState } from 'react'

export function useSupabaseUpload() {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  /**
   * Uploads a file via signed URL (backend-secure, supports large files)
   * @param file File object to upload
   * @param context Folder/subdirectory name (e.g. 'lessons', 'course-images')
   */
  const uploadFile = async (file: File, context = 'lessons') => {
    try {
      setError(null)
      setProgress(0)
      setFileUrl(null)

      console.log('🧩 Requesting signed upload URL for:', file.name)

      // Step 1️⃣ — Ask backend to create signed upload URL
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          context,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate upload URL')
      const { uploadUrl, publicUrl, error: urlError } = await res.json()
      if (urlError || !uploadUrl) throw new Error(urlError || 'Missing signed URL')

      console.log('✅ Received signed upload URL:', uploadUrl)

      // Step 2️⃣ — PUT the file directly to Supabase via signed URL
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type)

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
      })

      xhr.send(file)
      await uploadPromise

      console.log('✅ File uploaded successfully to Supabase')

      setFileUrl(publicUrl)
      return { success: true, url: publicUrl }
    } catch (err: any) {
      console.error('🧨 Full upload error object:', err)
      setError(err.message || 'Upload failed.')
      return { success: false, error: err.message || 'Upload failed.' }
    }
  }

  /**
   * 🗑️ Securely deletes a file from Supabase storage
   * Requires backend endpoint `/api/delete-file` to perform deletion via Supabase admin API
   * @param filePath File path (e.g. lessons/video.mp4)
   */
  const deleteFile = async (filePath: string) => {
    try {
      const res = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      })
      if (!res.ok) throw new Error('Failed to delete file')
      return { success: true }
    } catch (err: any) {
      console.error('🧨 Delete error:', err)
      return { success: false, error: err.message || 'Delete failed.' }
    }
  }

  return { uploadFile, deleteFile, progress, error, fileUrl }
}
