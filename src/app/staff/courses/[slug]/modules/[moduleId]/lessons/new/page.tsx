'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import LessonTabs from './components/LessonTabs'
import LessonInfoPanel from './components/LessonInfoPanel'
import LessonResourcesPanel from './components/LessonResourcesPanel'
import LessonQuizPanel from './components/LessonQuizPanel'
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

const LESSON_DRAFT_KEY = 'lesson_draft'

export default function NewLessonPage() {
  const router = useRouter()
  const { slug, moduleId } = useParams() // ✅ matches /api/modules/[id]/lessons

  const [activeTab, setActiveTab] = useState<'info' | 'resources' | 'quiz'>('info')
  const [loading, setLoading] = useState(false)

  // ✅ Restore draft from localStorage
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LESSON_DRAFT_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return { title: '', description: '', videoUrl: null, fileUrl: null, fileType: null }
        }
      }
    }
    return { title: '', description: '', videoUrl: null, fileUrl: null, fileType: null }
  })

  const [quizQuestions, setQuizQuestions] = useState<
    { question: string; options: string[]; correct: string }[]
  >([])

  // ✅ Auto-save draft
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LESSON_DRAFT_KEY, JSON.stringify(formData))
    }
  }, [formData])

  // 🧠 Track section completion
  const completionStatus = useMemo(() => {
    const infoComplete = !!formData.title.trim() && !!formData.description.trim()
    const resourcesComplete = !!formData.videoUrl || !!formData.fileUrl
    const quizComplete = quizQuestions.length > 0
    return { infoComplete, resourcesComplete, quizComplete }
  }, [formData, quizQuestions])

  // ✅ Save entire lesson (info + resources + quiz)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!completionStatus.infoComplete) {
      toast.error('Please fill in lesson title and description.')
      setActiveTab('info')
      return
    }

    if (!completionStatus.resourcesComplete) {
      toast.error('Please upload at least one resource (video or file).')
      setActiveTab('resources')
      return
    }

    if (!completionStatus.quizComplete) {
      toast.error('Please add at least one quiz question.')
      setActiveTab('quiz')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl,
          fileUrl: formData.fileUrl,
          fileType: formData.fileType,
          quizzes: quizQuestions, // ✅ included directly
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create lesson')
      }

      // ✅ Clear localStorage draft
      localStorage.removeItem(LESSON_DRAFT_KEY)

      toast.success('✅ Lesson, resources, and quiz saved successfully!')
      setTimeout(() => router.push(`/staff/courses/${slug}`), 1000)
    } catch (err: any) {
      console.error('❌ Lesson save error:', err)
      toast.error(err.message || 'Error creating lesson or quiz.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8 pt-[88px]">
      {/* 🧭 Breadcrumbs */}
      <BreadcrumbHeader courseSlug={slug as string} currentLabel="Add New Lesson" />

      {/* 🔙 Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={() => router.push(`/staff/courses/${slug}`)}
          className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Course Editor
        </Button>
      </div>

      {/* 🧱 Page header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400">
          Add New Lesson
        </h1>
        <p className="text-gray-400 mt-2">
          Create a new lesson, upload resources, and add a quiz for your learners.
        </p>
      </div>

      {/* ✅ Section tracker */}
      <div className="flex justify-center gap-8 mb-6 text-sm">
        <div className="flex items-center gap-2">
          {completionStatus.infoComplete ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-yellow-400" />
          )}
          <span
            className={completionStatus.infoComplete ? 'text-green-400' : 'text-yellow-400'}
          >
            Lesson Info {completionStatus.infoComplete ? 'Complete' : 'Missing'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completionStatus.resourcesComplete ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-yellow-400" />
          )}
          <span
            className={completionStatus.resourcesComplete ? 'text-green-400' : 'text-yellow-400'}
          >
            Resources {completionStatus.resourcesComplete ? 'Complete' : 'Missing'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completionStatus.quizComplete ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-yellow-400" />
          )}
          <span
            className={completionStatus.quizComplete ? 'text-green-400' : 'text-yellow-400'}
          >
            Quiz {completionStatus.quizComplete ? 'Complete' : 'Missing'}
          </span>
        </div>
      </div>

      {/* 🔹 Tabs */}
      <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🧩 Tab Panels */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-xl mt-4 relative"
      >
        {activeTab === 'info' && (
          <LessonInfoPanel formData={formData} setFormData={setFormData} />
        )}

        {activeTab === 'resources' && (
          <LessonResourcesPanel formData={formData} setFormData={setFormData} />
        )}

        {activeTab === 'quiz' && (
          <LessonQuizPanel
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
          />
        )}

        {/* ✅ Save button */}
        <div className="flex justify-end mt-8 relative z-[9999]">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Save Lesson
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
