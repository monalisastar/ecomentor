'use client'

import { useEffect, useState } from 'react'
import { X, Save, UploadCloud, Loader2, Eye, Pencil } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lesson } from '@/types/course'
import slugify from 'slugify'

type LessonEditorProps = {
  open: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => void | Promise<void>
  initialLesson: Lesson | null
  moduleId?: string
}

export default function LessonEditor({
  open,
  onClose,
  onSave,
  initialLesson,
  moduleId,
}: LessonEditorProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [content, setContent] = useState('')

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [detecting, setDetecting] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const localKey = moduleId ? `lesson_${moduleId}` : 'lesson_draft'

  // 🧠 Load saved draft
  useEffect(() => {
    const saved = localStorage.getItem(localKey)
    if (saved && !initialLesson) {
      try {
        const parsed = JSON.parse(saved)
        setTitle(parsed.title || '')
        setDuration(parsed.duration || '')
        setVideoUrl(parsed.videoUrl || '')
        setDocumentUrl(parsed.documentUrl || '')
        setContent(parsed.content || '')
      } catch {
        console.warn('Failed to parse saved draft')
      }
    }
  }, [localKey, initialLesson])

  // 💾 Auto-save draft
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content || duration || videoUrl || documentUrl) {
        const draft = { title, duration, videoUrl, documentUrl, content }
        localStorage.setItem(localKey, JSON.stringify(draft))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [title, duration, content, videoUrl, documentUrl, localKey])

  // 🧠 Fetch existing lesson for module
  useEffect(() => {
    const fetchExistingLesson = async () => {
      if (!moduleId || initialLesson) return
      try {
        setDetecting(true)
        const existing = await apiRequest(`lessons?moduleId=${moduleId}`, 'GET')
        if (existing?.length > 0) {
          const lesson = existing[0]
          setTitle(lesson.title || '')
          setDuration(lesson.duration || '')
          setVideoUrl(lesson.videoUrl || '')
          setDocumentUrl(lesson.documentUrl || '')
          setContent(lesson.content || '')
        }
      } catch (err) {
        console.error('Auto-detect failed:', err)
      } finally {
        setDetecting(false)
      }
    }
    fetchExistingLesson()
  }, [moduleId, initialLesson])

  // Prefill on edit
  useEffect(() => {
    if (initialLesson) {
      setTitle(initialLesson.title || '')
      setDuration(initialLesson.duration || '')
      setVideoUrl(initialLesson.videoUrl || '')
      setDocumentUrl(initialLesson.documentUrl || '')
      setContent(initialLesson.content || '')
    }
  }, [initialLesson])

  // 📤 Upload with progress
  const handleFileUpload = async (file: File, type: 'video' | 'document') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('context', 'lesson') // ensures storage under lessons/

    try {
      setUploading(true)
      setProgress(0)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText)
          if (type === 'video') setVideoUrl(res.url)
          else setDocumentUrl(res.url)
          alert(`${type} uploaded successfully!`)
        } else {
          alert(`Failed to upload ${type}.`)
          console.error(xhr.responseText)
        }
        setUploading(false)
        setProgress(0)
      }

      xhr.onerror = () => {
        setUploading(false)
        alert('Upload failed. Please try again.')
      }

      xhr.send(formData)
    } catch (err) {
      console.error('Upload failed:', err)
      alert(`Failed to upload ${type}.`)
      setUploading(false)
    }
  }

  // 💾 Save Lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Lesson title is required.')
      return
    }

    const lesson: Lesson = {
      id: initialLesson?.id || '',
      slug: initialLesson?.slug || slugify(title, { lower: true }),
      title,
      duration,
      videoUrl,
      documentUrl,
      content,
      moduleId: moduleId || '',
    }

    await onSave(lesson)
    localStorage.removeItem(localKey)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialLesson ? 'Edit Lesson' : 'Add / Auto-Detect Lesson'}
          </h2>
          {detecting && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" /> Checking existing lessons...
            </div>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-1"
        >
          {/* Title */}
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
              placeholder="e.g. 10:45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Markdown Content */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Lesson Content
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-3 py-1.5 transition ${
                    activeTab === 'write'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Pencil size={14} /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1.5 transition ${
                    activeTab === 'preview'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write or paste your Markdown content..."
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
              />
            ) : (
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 prose prose-green max-w-none text-sm text-gray-800">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500 italic">Nothing to preview yet...</p>
                )}
              </div>
            )}
          </div>

          {/* Upload Video */}
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
                {uploading ? `Uploading ${progress}%` : 'Upload Video'}
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

          {/* Upload Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Document (PDF, PPT, DOC)
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
                {uploading ? `Uploading ${progress}%` : 'Upload Document'}
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
