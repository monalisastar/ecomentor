'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import UploadPanel, { UploadedFile } from '@/components/UploadPanel'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload'

interface LessonUploadsPanelProps {
  lessonId: string
  videoUrl: string | null
  documentUrl: string | null
  setVideoUrl: (value: string | null) => void
  setDocumentUrl: (value: string | null) => void
  autoUpdateField: (field: string, value: string | null) => Promise<void>
}

export default function LessonUploadsPanel({
  lessonId,
  videoUrl,
  documentUrl,
  setVideoUrl,
  setDocumentUrl,
  autoUpdateField,
}: LessonUploadsPanelProps) {
  const [videoMeta, setVideoMeta] = useState<any>(null)
  const [docMeta, setDocMeta] = useState<any>(null)
  const { uploadFile, deleteFile } = useSupabaseUpload()

  // 🧠 Fetch stored metadata
  useEffect(() => {
    const fetchLesson = async () => {
      const res = await fetch(`/api/lessons/${lessonId}`)
      if (!res.ok) return
      const data = await res.json()
      setVideoMeta({
        name: data.videoName,
        size: data.videoSize,
        uploadedAt: data.videoUploaded,
      })
      setDocMeta({
        name: data.fileName,
        size: data.fileSize,
        uploadedAt: data.fileUploaded,
      })
    }
    fetchLesson()
  }, [lessonId])

  // 📏 Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 💾 Save metadata
  const handleMetadataSave = async (
    type: 'video' | 'document',
    file: File,
    url: string
  ): Promise<void> => {
    const meta = {
      name: file.name,
      size: formatBytes(file.size),
      uploadedAt: new Date().toLocaleString(),
    }

    const payload =
      type === 'video'
        ? {
            videoUrl: url,
            videoName: meta.name,
            videoSize: meta.size,
            videoUploaded: meta.uploadedAt,
          }
        : {
            fileUrl: url,
            fileName: meta.name,
            fileSize: meta.size,
            fileUploaded: meta.uploadedAt,
          }

    await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (type === 'video') setVideoMeta(meta)
    else setDocMeta(meta)
  }

  // 🗑️ Delete
  const handleDelete = async (
    type: 'video' | 'document',
    url: string | null
  ): Promise<void> => {
    if (!url) {
      toast.error('No file to delete.')
      return
    }
    toast.info(`Deleting ${type}...`)

    try {
      const filePath = decodeURIComponent(url.split('/').pop() || '')
      const res = await deleteFile(filePath)
      if (!res.success) throw new Error(res.error)

      await autoUpdateField(type === 'video' ? 'videoUrl' : 'fileUrl', null)
      if (type === 'video') {
        setVideoUrl(null)
        setVideoMeta(null)
      } else {
        setDocumentUrl(null)
        setDocMeta(null)
      }
      toast.success(`✅ ${type === 'video' ? 'Video' : 'Document'} deleted successfully!`)
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error(err.message || 'Unexpected error while deleting file.')
    }
  }

  // 🔄 Replace
  const handleReplace = async (type: 'video' | 'document', file: File): Promise<void> => {
    try {
      toast.info(`Replacing ${type}...`)
      const res = await uploadFile(file, type === 'video' ? 'lesson-videos' : 'lesson-documents')
      if (!res.success || !res.url) throw new Error(res.error || 'Upload failed')

      await handleMetadataSave(type, file, res.url)
      if (type === 'video') {
        setVideoUrl(res.url)
        toast.success('🎥 Video replaced successfully!')
      } else {
        setDocumentUrl(res.url)
        toast.success('📄 Document replaced successfully!')
      }
    } catch (err: any) {
      console.error('Replace error:', err)
      toast.error(err.message || 'Replace failed.')
    }
  }

  return (
    <motion.div
      key="uploads"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 relative"
    >
      {/* 🎥 LESSON VIDEO */}
      <div>
        <h3 className="text-lg font-semibold text-green-400 mb-2">🎥 Lesson Video</h3>
        <UploadPanel
          fixedContext="lesson-videos"
          fileType="video"
          fileUrl={videoUrl}
          multiple={false}
          onUploaded={async (files: UploadedFile[], fileUrl?: string) => {
            const first = files?.[0]
            if (fileUrl && first?.file) {
              setVideoUrl(fileUrl)
              await handleMetadataSave('video', first.file, fileUrl)
              toast.success('🎥 Video uploaded successfully!')
            }
          }}
          onReplace={async (file) => handleReplace('video', file)}
          onDelete={async (url) => handleDelete('video', url)}
        />
        {videoMeta && (
          <div className="bg-black/40 text-gray-200 px-4 py-2 border-t border-white/10 flex flex-col gap-1 text-xs mt-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Info size={12} className="text-green-300" />
              <span className="font-medium">{videoMeta.name}</span>
            </div>
            <p>Size: {videoMeta.size}</p>
            <p>Uploaded: {videoMeta.uploadedAt}</p>
          </div>
        )}
      </div>

      {/* 📘 LESSON DOCUMENT */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">📘 Lesson Document</h3>
        <UploadPanel
          fixedContext="lesson-documents"
          fileType="document"
          fileUrl={documentUrl}
          multiple={false}
          onUploaded={async (files: UploadedFile[], fileUrl?: string) => {
            const first = files?.[0]
            if (fileUrl && first?.file) {
              setDocumentUrl(fileUrl)
              await handleMetadataSave('document', first.file, fileUrl)
              toast.success('📄 Document uploaded successfully!')
            }
          }}
          onReplace={async (file) => handleReplace('document', file)}
          onDelete={async (url) => handleDelete('document', url)}
        />
        {docMeta && (
          <div className="bg-black/40 text-gray-200 px-4 py-2 border-t border-white/10 flex flex-col gap-1 text-xs mt-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Info size={12} className="text-yellow-300" />
              <span className="font-medium">{docMeta.name}</span>
            </div>
            <p>Size: {docMeta.size}</p>
            <p>Uploaded: {docMeta.uploadedAt}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
