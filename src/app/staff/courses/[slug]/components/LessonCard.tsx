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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lesson } from '@/types/course'

// 🎥 Helper: Custom Markdown Renderer with YouTube & Vimeo Embeds
const MarkdownWithEmbeds = ({ content }: { content: string }) => {
  const transformLinks = (url: string) => {
    // YouTube patterns
    const youtubeMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
    )
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      return (
        <div className="my-4 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border border-gray-200"
          ></iframe>
        </div>
      )
    }

    // Vimeo pattern
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      const videoId = vimeoMatch[1]
      return (
        <div className="my-4 aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border border-gray-200"
          ></iframe>
        </div>
      )
    }

    // Default link rendering
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-700 underline hover:text-green-800"
      >
        {url}
      </a>
    )
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (href ? transformLinks(href) : <>{children}</>),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

type LessonCardProps = {
  lesson: Lesson
  onUpdated?: (lesson: Lesson) => void | Promise<void>
  onDeleted?: (lessonId: string) => void | Promise<void>
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
      <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-lg p-5 hover:bg-gray-100 transition relative space-y-4">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-green-600" size={20} />
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 text-green-700 rounded-full p-2 flex-shrink-0">
              <PlayCircle size={18} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
              {lesson.duration && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Duration: {lesson.duration}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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

        {/* Lesson Content — Markdown + YouTube/Vimeo Embed */}
        {lesson.content && (
          <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-700 leading-relaxed prose prose-green max-w-none">
            <MarkdownWithEmbeds content={lesson.content} />
          </div>
        )}

        {/* Attachments */}
        {(lesson.videoUrl || lesson.documentUrl) && (
          <div className="flex gap-2 flex-wrap">
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
        )}
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
