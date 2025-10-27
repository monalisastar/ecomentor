'use client'

import { useState } from 'react'
import {
  PlayCircle,
  FileText,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lesson } from '@/types/course' // ✅ unified typing

type LessonCardProps = {
  lesson: Lesson
  onUpdated?: (lesson: Lesson) => void | Promise<void> // ✅ async-safe
  onDeleted?: (lessonId: string) => void | Promise<void> // ✅ async-safe
}

export default function LessonCard({ lesson, onUpdated, onDeleted }: LessonCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewType, setViewType] = useState<'video' | 'document' | null>(null)
  const [loading, setLoading] = useState(false)

  const openViewer = (type: 'video' | 'document') => {
    setViewType(type)
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    setViewType(null)
    setIsViewerOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return
    try {
      setLoading(true)
      await apiRequest(`lessons/${lesson.id}`, 'DELETE')
      await onDeleted?.(lesson.id)
    } catch (err) {
      console.error('Error deleting lesson:', err)
      alert('Failed to delete lesson. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Lesson Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-green-600" size={20} />
          </div>
        )}

        {/* Left — lesson info */}
        <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="bg-green-100 text-green-700 rounded-full p-2 flex-shrink-0">
            <PlayCircle size={18} />
          </div>

          <div>
            <p className="font-medium text-gray-900">{lesson.title}</p>
            {lesson.duration && (
              <p className="text-xs text-gray-500">Duration: {lesson.duration}</p>
            )}

            <div className="flex gap-2 mt-2 flex-wrap">
              {lesson.videoUrl && (
                <button
                  onClick={() => openViewer('video')}
                  className="flex items-center gap-1 text-xs text-green-700 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-md transition"
                >
                  <PlayCircle size={12} />
                  Watch Video
                </button>
              )}

              {lesson.documentUrl && (
                <button
                  onClick={() => openViewer('document')}
                  className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md transition"
                >
                  <FileText size={12} />
                  View Document
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex gap-3 mt-3 sm:mt-0 sm:ml-auto">
          {(lesson.videoUrl || lesson.documentUrl) && (
            <button
              onClick={() =>
                window.open(lesson.videoUrl || lesson.documentUrl || '', '_blank')
              }
              className="text-gray-600 hover:text-gray-900 transition"
              title="Open in new tab"
            >
              <ExternalLink size={15} />
            </button>
          )}

          {onUpdated && (
            <button
              onClick={() => onUpdated(lesson)}
              className="text-blue-600 hover:text-blue-800 transition"
              title="Edit lesson"
            >
              <Edit size={16} />
            </button>
          )}

          {onDeleted && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition"
              title="Delete lesson"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 📺 Modal Viewer */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 relative overflow-hidden">
            <button
              onClick={closeViewer}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X size={22} />
            </button>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lesson.title}
              </h3>
              {lesson.duration && (
                <p className="text-xs text-gray-500 mb-4">
                  Duration: {lesson.duration}
                </p>
              )}

              {/* Video Viewer */}
              {viewType === 'video' && lesson.videoUrl && (
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full rounded-lg border border-gray-200"
                />
              )}

              {/* Document Viewer */}
              {viewType === 'document' && lesson.documentUrl && (
                <iframe
                  src={lesson.documentUrl}
                  className="w-full h-[80vh] border border-gray-200 rounded-lg"
                  title={lesson.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
