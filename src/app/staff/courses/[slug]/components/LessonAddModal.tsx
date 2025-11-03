'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, FileText, Video, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UploadPanel from '@/components/UploadPanel'
import { toast } from 'sonner'

interface LessonAddModalProps {
  open: boolean
  onClose: () => void
  moduleId: string
  onLessonCreated: () => Promise<void> | void
}

export default function LessonAddModal({
  open,
  onClose,
  moduleId,
  onLessonCreated,
}: LessonAddModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ Submit new lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Please enter a lesson title')

    try {
      setLoading(true)
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          fileUrl, // ✅ aligned with schema field
        }),
      })

      if (!res.ok) throw new Error('Failed to create lesson')

      toast.success('✅ Lesson added successfully!')
      await onLessonCreated()
      onClose()

      // Reset form
      setTitle('')
      setDescription('')
      setVideoUrl(null)
      setFileUrl(null)
    } catch (err: any) {
      toast.error(err.message || 'Error creating lesson.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* ❌ Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
            >
              <X size={20} />
            </button>

            {/* 🧱 Header */}
            <h2 className="text-2xl font-semibold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400">
              Add New Lesson
            </h2>
            <p className="text-gray-300 text-center text-sm mb-6">
              Create a new lesson for this module. You can upload a video and document if needed.
            </p>

            {/* 🧾 Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Lesson Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. Understanding Carbon Footprints"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  placeholder="Briefly describe what this lesson covers..."
                />
              </div>

              {/* Upload Panels */}
              <div className="space-y-4">
                {/* 🎥 Video Upload */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <Video size={16} className="text-yellow-300" />
                    Upload Lesson Video
                  </label>
                  <UploadPanel
                    fixedContext="lesson-videos"
                    onUploaded={(url) => {
                      if (typeof url === 'string') {
                        setVideoUrl(url)
                        toast.success('🎥 Video uploaded successfully!')
                      }
                    }}
                  />
                  {videoUrl && (
                    <p className="text-xs text-green-400 mt-1 truncate">{videoUrl}</p>
                  )}
                </div>

                {/* 📄 Document Upload */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-blue-300" />
                    Upload Lesson File (PDF, DOCX, etc.)
                  </label>
                  <UploadPanel
                    fixedContext="lesson-documents"
                    onUploaded={(url) => {
                      if (typeof url === 'string') {
                        setFileUrl(url)
                        toast.success('📄 File uploaded successfully!')
                      }
                    }}
                  />
                  {fileUrl && (
                    <p className="text-xs text-green-400 mt-1 truncate">{fileUrl}</p>
                  )}
                </div>
              </div>

              {/* ✅ Save Button */}
              <div className="flex justify-end mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      Save Lesson
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
