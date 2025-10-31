'use client'

import { useState } from 'react'
import { X, PlusCircle, Upload, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lesson } from '@/types/course'

type AddLessonModalProps = {
  open: boolean
  moduleId: string
  onClose: () => void
  onAdded: (lesson: Lesson) => void | Promise<void>
}

export default function AddLessonModal({
  open,
  moduleId,
  onClose,
  onAdded,
}: AddLessonModalProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return alert('Please provide a lesson title.')

    try {
      setLoading(true)

      // 📦 Prepare FormData
      const formData = new FormData()
      formData.append('title', title)
      formData.append('duration', duration || '—')
      formData.append('moduleId', moduleId)
      if (lessonContent) formData.append('content', lessonContent)
      if (videoFile) formData.append('videoFile', videoFile)
      if (documentFile) formData.append('documentFile', documentFile)

      // 🚀 Send to backend
      const newLesson: Lesson = await apiRequest('lessons', 'POST', formData, true)
      await onAdded(newLesson)

      // Reset form
      setTitle('')
      setDuration('')
      setLessonContent('')
      setVideoFile(null)
      setDocumentFile(null)
      onClose()
    } catch (err) {
      console.error('Error adding lesson:', err)
      alert('Failed to add lesson. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setDocumentFile(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Lesson</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
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
            <p className="text-xs text-gray-500 mt-1">
              You can include text-based lesson material here — uploads are optional.
            </p>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Video <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <Upload size={16} />
                <span>{videoFile ? videoFile.name : 'Select Video File'}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PDF or PPT Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF or PPT <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <Upload size={16} />
                <span>
                  {documentFile ? documentFile.name : 'Select PDF/PPT File'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleDocumentChange}
                  className="hidden"
                />
              </label>
            </div>
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
