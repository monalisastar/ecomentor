'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import LessonTabs from './components/LessonTabs'
import LessonInfoPanel from './components/LessonInfoPanel'
import LessonResourcesPanel from './components/LessonResourcesPanel'
import LessonQuizPanel from './components/LessonQuizPanel'

import { ArrowLeft, Loader2, UploadCloud } from 'lucide-react'

export default function NewLessonPage() {
  const router = useRouter()
  const { slug, moduleId } = useParams()

  const [activeTab, setActiveTab] = useState<'info' | 'resources' | 'quiz'>('info')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: null as string | null,
    fileUrl: null as string | null,
  })

  const [quizQuestions, setQuizQuestions] = useState<
    { question: string; options: string[]; correct: string }[]
  >([])

  // ✅ Create lesson + quiz
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return toast.error('Please enter a lesson title')

    try {
      setLoading(true)

      // 1️⃣ Create lesson
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl,
          fileUrl: formData.fileUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to create lesson')
      const newLesson = await res.json()

      // 2️⃣ Create quiz (if any)
      if (quizQuestions.length > 0 && newLesson.id) {
        const quizRes = await fetch(`/api/lessons/${newLesson.id}/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizQuestions),
        })

        if (!quizRes.ok)
          throw new Error('Lesson saved, but quiz upload failed. Please retry.')
      }

      toast.success('✅ Lesson and quiz added successfully!')
      setTimeout(() => router.push(`/staff/courses/${slug}`), 1000)
    } catch (err: any) {
      console.error(err)
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

      {/* 🔹 Tabs */}
      <LessonTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🧩 Tab Panels */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-xl mt-4"
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
        <div className="flex justify-end mt-8">
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
