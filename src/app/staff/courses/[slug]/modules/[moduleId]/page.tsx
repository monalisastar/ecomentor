'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PlusCircle, Loader2 } from 'lucide-react'
import LessonCard from '../../components/LessonCard'
import LessonEditor from '../../components/LessonEditor'
import AddLessonModal from '../../components/AddLessonModal'
import { apiRequest } from '@/lib/api'
import type { Lesson } from '@/types/course'

export default function ModulePage() {
  const { slug, moduleId } = useParams()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [module, setModule] = useState<{ title: string } | null>(null)
  const [course, setCourse] = useState<{ title: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  // 🔄 Fetch course + module + lessons
  useEffect(() => {
    async function fetchModuleAndLessons() {
      try {
        // Fetch course details
        const courseData = await apiRequest(`courses/${slug}`, 'GET')
        setCourse(courseData)

        // Fetch module details
        const moduleData = await apiRequest(`modules/${moduleId}`, 'GET')
        setModule(moduleData)

        // Fetch lessons
        const lessonData = await apiRequest(`lessons?moduleId=${moduleId}`, 'GET')
        setLessons(lessonData)
      } catch (err) {
        console.error('Error fetching data:', err)
        alert('Failed to load module or course details.')
      } finally {
        setLoading(false)
      }
    }
    fetchModuleAndLessons()
  }, [slug, moduleId])

  // ➕ Add new lesson
  const handleAddLesson = async (data: Omit<Lesson, 'id'>) => {
    try {
      const created = await apiRequest('lessons', 'POST', { ...data, moduleId })
      setLessons((prev) => [...prev, created])
      setAddModalOpen(false)
    } catch (err) {
      console.error('Error adding lesson:', err)
      alert('Failed to add lesson.')
    }
  }

  // ✏️ Edit lesson
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setEditorOpen(true)
  }

  // 💾 Save edited lesson
  const handleSaveLesson = async (updated: Lesson) => {
    try {
      const saved = await apiRequest(`lessons/${updated.id}`, 'PATCH', updated)
      setLessons((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
      setEditorOpen(false)
    } catch (err) {
      console.error('Error saving lesson:', err)
      alert('Failed to save lesson.')
    }
  }

  // 🗑️ Delete lesson
  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    try {
      await apiRequest(`lessons/${id}`, 'DELETE')
      setLessons((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error('Error deleting lesson:', err)
      alert('Failed to delete lesson.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-600 mr-2" />
        <span>Loading lessons...</span>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-[88px] sm:pt-[96px] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={`/staff/courses/${slug}`}
            className="flex items-center text-gray-600 hover:text-green-700 transition"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Modules
          </Link>

          <div className="mt-2 sm:mt-0">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {course ? course.title : 'Course'}
              </span>{' '}
              →{' '}
              <span className="font-medium text-green-700">
                {module ? module.title : 'Module'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={18} />
          Add Lesson
        </button>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-900">
        {module ? module.title : 'Loading...'} — Lesson Builder
      </h1>

      {/* Lessons List */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lessons in this Module
        </h2>

        {lessons.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onUpdated={handleEditLesson}
                onDeleted={() => handleDeleteLesson(lesson.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No lessons yet. Add one to begin building this module.
          </p>
        )}
      </section>

      {/* Modals */}
      <AddLessonModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={(lesson) => setLessons((prev) => [...prev, lesson])}
        moduleId={String(moduleId)}
      />

      <LessonEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveLesson}
        initialLesson={editingLesson}
      />
    </main>
  )
}
