'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Loader2,
  FileText,
  UploadCloud,
  Video,
  LayoutGrid,
  Save,
  ClipboardList,
} from 'lucide-react'
import UploadPanel from '@/components/UploadPanel'
import LessonQuizPanel from './components/LessonQuizPanel'

export default function LessonEditorPage() {
  const router = useRouter()
  const { slug, moduleId, lessonId } = useParams()

  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'content' | 'quiz'>('overview')

  // 🧠 Local form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // 🔄 Fetch lesson details
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`)
        if (!res.ok) throw new Error('Failed to fetch lesson details')
        const data = await res.json()
        setLesson(data)
        setTitle(data.title || '')
        setDescription(data.description || '')
        setContent(data.content || '')
        setVideoUrl(data.videoUrl || null)
        setFileUrl(data.fileUrl || null) // ✅ Correct field
      } catch (err: any) {
        toast.error(err.message || 'Error loading lesson')
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) fetchLesson()
  }, [lessonId])

  // 💾 Save lesson updates
  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        title,
        description,
        content,
        videoUrl,
        fileUrl, // ✅ updated
        fileType: fileUrl ? 'document' : null,
      }

      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to save changes')
      toast.success('✅ Lesson updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error saving lesson.')
    } finally {
      setSaving(false)
    }
  }

  // ⚙️ Patch helper — auto save field (for uploads)
  const autoUpdateField = async (field: string, value: string | null) => {
    try {
      if (!lessonId) return
      await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      toast.success(`${field === 'videoUrl' ? '🎥 Video' : '📘 File'} linked successfully!`)
    } catch {
      toast.error(`Failed to update ${field}`)
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
        <Loader2 className="animate-spin text-white/70" size={40} />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 pt-[88px] flex flex-col items-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />

      {/* Header */}
      <div className="z-10 w-full max-w-6xl flex justify-between items-center mb-8">
        <Button
          variant="outline"
          onClick={() => router.push(`/staff/courses/${slug}`)}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Course Editor
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Lesson'}
        </Button>
      </div>

      {/* Glassmorphic Card */}
      <section className="relative z-10 w-full max-w-6xl p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-white">
        <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400 drop-shadow-md">
          Lesson Editor — {lesson?.title || 'Untitled'}
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'overview', icon: LayoutGrid, label: 'Overview' },
            { key: 'uploads', icon: UploadCloud, label: 'Uploads' },
            { key: 'content', icon: FileText, label: 'Content' },
            { key: 'quiz', icon: ClipboardList, label: 'Quizzes' },
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 ${
                activeTab === key
                  ? 'bg-green-700 text-white'
                  : 'bg-white/10 text-gray-200 border-white/20'
              }`}
            >
              <Icon size={16} />
              {label}
            </Button>
          ))}
        </div>

        {/* Animated Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-gray-200 block mb-2">Lesson Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/10 text-white border-white/30"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="text-sm text-gray-200 block mb-2">Lesson Summary</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 text-white border-white/30"
                  placeholder="Brief summary of this lesson..."
                  rows={4}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'uploads' && (
            <motion.div
              key="uploads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Video Upload */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Video size={18} className="text-green-300" />
                  Lesson Video
                </h3>
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg mb-3 border border-white/20"
                  />
                )}
                <UploadPanel
                  fixedContext="lesson-videos"
                  fileType="video"
                  multiple={false}
                  onUploaded={async (files) => {
                    const first = files?.[0]?.url ?? null
                    if (first) {
                      setVideoUrl(first)
                      await autoUpdateField('videoUrl', first)
                    }
                  }}
                />
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-yellow-300" />
                  Lesson Document
                </h3>
                {fileUrl && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-64 rounded-lg border border-white/20 bg-white/5"
                  />
                )}
                <UploadPanel
                  fixedContext="lesson-documents"
                  fileType="document"
                  multiple={false}
                  onUploaded={async (files) => {
                    const first = files?.[0]?.url ?? null
                    if (first) {
                      setFileUrl(first)
                      await autoUpdateField('fileUrl', first)
                      await autoUpdateField('fileType', 'document')
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-3 text-green-300">
                Lesson Content
              </h3>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-white/10 text-white border-white/30 min-h-[300px]"
                placeholder="Write or paste your lesson content here..."
              />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LessonQuizPanel lessonId={lessonId as string} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  )
}
