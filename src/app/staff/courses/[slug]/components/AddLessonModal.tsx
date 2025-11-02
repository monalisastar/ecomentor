'use client'

import { useState, useEffect } from 'react'
import { X, PlusCircle, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lesson } from '@/types/course'
import UploadPanel from '@/components/UploadPanel'

type AddLessonModalProps = {
  open: boolean
  moduleId: string
  moduleTitle?: string
  onClose: () => void
  onAdded: (lesson: Lesson) => void | Promise<void>
}

/**
 * 🎥 AddLessonModal (Unified with UploadPanel)
 * --------------------------------------------------------
 * Handles lesson creation and uploads (video, PDF, PPT).
 * Uses Supabase via useSupabaseUpload for all files.
 */
export default function AddLessonModal({
  open,
  moduleId,
  moduleTitle,
  onClose,
  onAdded,
}: AddLessonModalProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // 🧠 Prefill title when opened after module creation
  useEffect(() => {
    if (open && moduleTitle && !title) {
      setTitle(`Lesson 1 — ${moduleTitle}`)
    }
  }, [open, moduleTitle])

  if (!open) return null

  // 💾 Submit lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert('Please provide a lesson title.')

    try {
      setLoading(true)

      const payload: Partial<Lesson> = {
        title: title.trim(),
        duration: duration || '—',
        moduleId,
        content: lessonContent,
        videoUrl,
        documentUrl,
      }

      const newLesson: Lesson = await apiRequest('lessons', 'POST', payload)
      await onAdded(newLesson)
      resetForm()
      onClose()
    } catch (err) {
      console.error('❌ Error adding lesson:', err)
      alert('Failed to add lesson. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDuration('')
    setLessonContent('')
    setVideoUrl('')
    setDocumentUrl('')
  }

  // 🧩 Handle uploaded file
  const handleFileUploaded = (url: string, type: 'video' | 'document') => {
    if (type === 'video') setVideoUrl(url)
    else setDocumentUrl(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Lesson</h2>
            {moduleTitle && (
              <p className="text-xs text-gray-500">
                for module: <span className="font-medium">{moduleTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understanding Carbon Markets"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 10:30"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Lesson Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Content <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Write or paste the lesson content here..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Upload Video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Lesson Video
            </label>
            <UploadPanel
              fixedContext="videos"
              onUploaded={(url) => handleFileUploaded(url, 'video')}
            />
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

          {/* Upload Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF or PPT
            </label>
            <UploadPanel
              fixedContext="lessons"
              onUploaded={(url) => handleFileUploaded(url, 'document')}
            />
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Add Lesson
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
