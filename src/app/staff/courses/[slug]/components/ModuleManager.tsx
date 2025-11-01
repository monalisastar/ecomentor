'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  RefreshCw,
  Eye,
} from 'lucide-react'
import LessonEditor from './LessonEditor'
import ModuleModal from './ModuleModal'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import type { Lesson, Module } from '@/types/course'

/**
 * 🧭 ModuleManager — Eco-Mentor Staff Dashboard
 * ---------------------------------------------------
 * - Displays all modules & lessons for a course.
 * - Lets staff add, edit, or delete modules/lessons.
 * - Automatically opens LessonEditor when a new module is created.
 */
export default function ModuleManager() {
  const { slug } = useParams()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  // 🔁 Fetch all modules
  async function fetchModules(showToast = false) {
    try {
      setLoading(true)
      const res = await fetch(`/api/modules?courseSlug=${slug}`)
      const data = await res.json()
      setModules(data || [])
      if (showToast) toast.success('✅ Modules imported successfully!')
    } catch (err) {
      console.error('Error fetching modules:', err)
      toast.error('Failed to load modules.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [slug])

  // 🧠 Listen for “imported” event from CourseEditor
  useEffect(() => {
    const handleImported = () => {
      console.log('📦 Import event detected → refreshing modules...')
      fetchModules(true)
    }
    window.addEventListener('imported', handleImported)
    return () => window.removeEventListener('imported', handleImported)
  }, [])

  // 💾 When a module is created or edited
  const handleSaveModule = async (savedModule: Module) => {
    // Update list (edit or create)
    setModules((prev) => {
      const exists = prev.find((m) => m.id === savedModule.id)
      return exists
        ? prev.map((m) => (m.id === savedModule.id ? savedModule : m))
        : [...prev, savedModule]
    })

    // ✅ Automatically open LessonEditor for new module
    if (!editingModule) {
      setTargetModuleId(savedModule.id)
      setEditingLesson(null)
      setEditorOpen(true)
      toast.success('📘 Module added — ready to add lessons!')
    } else {
      toast.success('✅ Module updated!')
    }

    setEditingModule(null)
  }

  // 🗑️ Delete module
  const deleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return
    try {
      await fetch(`/api/modules/${id}`, { method: 'DELETE' })
      setModules((prev) => prev.filter((m) => m.id !== id))
      toast.success('🗑️ Module deleted.')
    } catch (err) {
      console.error('Error deleting module:', err)
      toast.error('Failed to delete module.')
    }
  }

  // ➕ Add Lesson
  const addLesson = (moduleId: string) => {
    setTargetModuleId(moduleId)
    setEditingLesson(null)
    setEditorOpen(true)
  }

  // ✏️ Edit Lesson
  const editLesson = (moduleId: string, lesson: Lesson) => {
    setTargetModuleId(moduleId)
    setEditingLesson(lesson)
    setEditorOpen(true)
  }

  // 💾 Save Lesson
  const saveLesson = async (lesson: Lesson): Promise<void> => {
    if (!targetModuleId) return
    try {
      const isEdit = !!editingLesson
      const url = isEdit
        ? `/api/lessons/${lesson.id}`
        : `/api/lessons?moduleId=${targetModuleId}`
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      })
      const saved = await res.json()

      setModules((prev) =>
        prev.map((m) =>
          m.id === targetModuleId
            ? {
                ...m,
                lessons: isEdit
                  ? m.lessons.map((l) => (l.id === saved.id ? saved : l))
                  : [...m.lessons, saved],
              }
            : m
        )
      )

      toast.success(isEdit ? '✅ Lesson updated!' : '📝 Lesson added!')
    } catch (err) {
      console.error('Error saving lesson:', err)
      toast.error('Could not save lesson.')
    }
  }

  // 🗑️ Delete Lesson
  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      )
      toast.success('🗑️ Lesson deleted.')
    } catch (err) {
      console.error('Error deleting lesson:', err)
      toast.error('Failed to delete lesson.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading modules...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">📚 Course Modules</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fetchModules()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingModule(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <PlusCircle size={18} />
            Add Module
          </button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No modules yet. Use Auto-Import or Add Module.
        </p>
      ) : (
        modules.map((module) => (
          <div
            key={module.id}
            className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
          >
            {/* Module Header */}
            <div className="flex justify-between items-center px-5 py-3 bg-green-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === module.id ? null : module.id
                    )
                  }
                  className="text-green-700 hover:text-green-900"
                >
                  {expandedModule === module.id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    <Link
                      href={`/staff/courses/${slug}/modules/${module.id}`}
                      className="text-green-700 hover:text-green-900 underline"
                    >
                      {module.title}
                    </Link>
                  </h3>
                  {module.description && (
                    <p className="text-xs text-gray-500">{module.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingModule(module)
                    setModalOpen(true)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteModule(module.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons */}
            {expandedModule === module.id && (
              <div className="p-5 space-y-3">
                {module.lessons.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No lessons yet in this module.
                  </p>
                ) : (
                  module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{lesson.title}</p>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          <ReactMarkdown>{lesson.content || ''}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            toast.info(`👁️ Previewing ${lesson.title}`)
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => editLesson(module.id, lesson)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteLesson(module.id, lesson.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* ➕ Add Lesson */}
                <button
                  onClick={() => addLesson(module.id)}
                  className="mt-2 flex items-center gap-2 text-sm text-green-700 hover:text-green-900 transition"
                >
                  <PlusCircle size={16} /> Add Lesson
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* ✏️ Lesson Editor */}
      <LessonEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={saveLesson}
        initialLesson={editingLesson}
        moduleId={targetModuleId || undefined}
      />

      {/* 🧱 Module Modal */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModule}
        initialData={
          editingModule
            ? {
                id: editingModule.id,
                title: editingModule.title,
                description: editingModule.description,
              }
            : null
        }
        courseId={slug as string}
      />
    </div>
  )
}
