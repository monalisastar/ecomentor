'use client'

import { useEffect, useState } from 'react'
import { X, Save, UploadCloud, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lesson } from '@/types/course' // ✅ use the unified Lesson type

type LessonEditorProps = {
  open: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => void | Promise<void> // ✅ allow async callbacks
  initialLesson: Lesson | null
}

export default function LessonEditor({
  open,
  onClose,
  onSave,
  initialLesson,
}: LessonEditorProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Prefill when editing
  useEffect(() => {
    if (initialLesson) {
      setTitle(initialLesson.title || '')
      setDuration(initialLesson.duration || '')
      setVideoUrl(initialLesson.videoUrl || '')
      setDocumentUrl(initialLesson.documentUrl || '')
    } else {
      setTitle('')
      setDuration('')
      setVideoUrl('')
      setDocumentUrl('')
    }
  }, [initialLesson])

  // 🧠 Handle file uploads
  const handleFileUpload = async (file: File, type: 'video' | 'document') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    try {
      setUploading(true)
      const res = await apiRequest('upload', 'POST', formData, true)
      if (type === 'video') setVideoUrl(res.url)
      else setDocumentUrl(res.url)
      alert(`${type} uploaded successfully.`)
    } catch (err) {
      console.error('Upload failed:', err)
      alert(`Failed to upload ${type}.`)
    } finally {
      setUploading(false)
    }
  }

  // 💾 Save lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Lesson title is required.')
      return
    }

    const lesson: Lesson = {
      id: initialLesson?.id || '', // ✅ ensure it's always a string
      title,
      duration,
      videoUrl,
      documentUrl,
    }

    await onSave(lesson) // ✅ support async save functions
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {initialLesson ? 'Edit Lesson' : 'Add Lesson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 5:30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Video (optional)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
            {videoFile && (
              <button
                type="button"
                onClick={() => handleFileUpload(videoFile, 'video')}
                disabled={uploading}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                Upload Video
              </button>
            )}
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-green-700 text-sm underline"
              >
                View Uploaded Video
              </a>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Document (PDF, PPT, etc.)
            </label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
            {docFile && (
              <button
                type="button"
                onClick={() => handleFileUpload(docFile, 'document')}
                disabled={uploading}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                Upload Document
              </button>
            )}
            {documentUrl && (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-700 text-sm underline"
              >
                View Uploaded Document
              </a>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Save size={16} />
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
