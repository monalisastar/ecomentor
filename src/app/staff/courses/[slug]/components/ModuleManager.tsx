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
} from 'lucide-react'
import LessonEditor from './LessonEditor'
import ModuleModal from './ModuleModal'
import { apiRequest } from '@/lib/api'
import type { Lesson, Module } from '@/types/course' // ✅ unified typing

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

  // 🔄 Fetch modules + lessons
  useEffect(() => {
    async function fetchModules() {
      try {
        const data = await apiRequest(`modules?courseId=${slug}`, 'GET')
        setModules(data)
      } catch (err) {
        console.error('Error fetching modules:', err)
        alert('Failed to load modules.')
      } finally {
        setLoading(false)
      }
    }
    fetchModules()
  }, [slug])

  // 💾 Add or Edit Module
  const handleSaveModule = async (data: { title: string; description?: string }) => {
    try {
      if (editingModule) {
        const updated = await apiRequest(`modules/${editingModule.id}`, 'PATCH', data)
        setModules((prev) =>
          prev.map((m) => (m.id === editingModule.id ? { ...m, ...updated } : m))
        )
      } else {
        const created = await apiRequest('modules', 'POST', {
          title: data.title,
          description: data.description,
          courseId: slug,
        })
        setModules((prev) => [...prev, created])
      }
    } catch (err) {
      console.error('Error saving module:', err)
      alert('Could not save module.')
    }
  }

  // 🗑️ Delete Module
  const deleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return
    try {
      await apiRequest(`modules/${id}`, 'DELETE')
      setModules((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Error deleting module:', err)
      alert('Failed to delete module.')
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

  // 💾 Save Lesson (Add or Edit)
  const saveLesson = async (lesson: Lesson): Promise<void> => {
    if (!targetModuleId) return
    try {
      if (editingLesson) {
        const updated = await apiRequest(`lessons/${lesson.id}`, 'PATCH', lesson)
        setModules((prev) =>
          prev.map((m) =>
            m.id === targetModuleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) => (l.id === updated.id ? updated : l)),
                }
              : m
          )
        )
      } else {
        const created = await apiRequest('lessons', 'POST', {
          ...lesson,
          moduleId: targetModuleId,
        })
        setModules((prev) =>
          prev.map((m) =>
            m.id === targetModuleId
              ? { ...m, lessons: [...m.lessons, created] }
              : m
          )
        )
      }
    } catch (err) {
      console.error('Error saving lesson:', err)
      alert('Could not save lesson.')
    }
  }

  // 🗑️ Delete Lesson
  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await apiRequest(`lessons/${lessonId}`, 'DELETE')
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      )
    } catch (err) {
      console.error('Error deleting lesson:', err)
      alert('Failed to delete lesson.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading modules...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Course Modules 📚</h2>
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

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No modules yet. Click “Add Module” to start building your course.
          </p>
        )}

        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
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
                  className="text-green-700 hover:text-green-900 transition"
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
                {module.lessons.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No lessons yet in this module.
                  </p>
                )}
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{lesson.title}</p>
                      {lesson.duration && (
                        <p className="text-xs text-gray-500">
                          Duration: {lesson.duration}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
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
                ))}

                {/* Add Lesson Button */}
                <button
                  onClick={() => addLesson(module.id)}
                  className="mt-2 flex items-center gap-2 text-sm text-green-700 hover:text-green-900 transition"
                >
                  <PlusCircle size={16} />
                  Add Lesson
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Editor */}
      <LessonEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={saveLesson}
        initialLesson={editingLesson}
      />

      {/* Module Modal */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModule}
        initialData={
          editingModule
            ? {
                title: editingModule.title,
                description: editingModule.description,
              }
            : null
        }
      />
    </div>
  )
}
