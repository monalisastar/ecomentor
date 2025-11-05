'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  BookOpen,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import ModuleAddModal from './ModuleAddModal'
import LessonList from './LessonList'

interface Lesson {
  id: string
  title: string
  description?: string
  createdAt?: string
  videoUrl?: string
  fileUrl?: string
}

interface Module {
  id: string
  title: string
  description?: string
  lessons?: Lesson[]
  createdAt?: string
}

interface ModuleListProps {
  courseSlug: string
  modules: Module[]
  onRefreshModules: () => Promise<void> | void
  onEditModule?: (moduleId: string) => void
  onDeleteModule?: (moduleId: string) => Promise<void> | void
}

export default function ModuleList({
  courseSlug,
  modules,
  onRefreshModules,
  onEditModule,
  onDeleteModule,
}: ModuleListProps) {
  const router = useRouter()
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // 🔽 Expand/Collapse Module
  const toggleExpand = (id: string) => {
    setExpandedModule((prev) => (prev === id ? null : id))
  }

  // 🗑️ Delete Module
  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return
    try {
      setDeleting(moduleId)
      await onDeleteModule?.(moduleId)
      toast.success('Module deleted successfully.')
      await onRefreshModules()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete module.')
    } finally {
      setDeleting(null)
    }
  }

  // 🗑️ Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete lesson.')
      toast.success('Lesson deleted successfully.')
      await onRefreshModules()
    } catch (err: any) {
      toast.error(err.message || 'Error deleting lesson.')
    }
  }

  return (
    <section className="w-full mt-8 relative">
      {/* Header with Add Module */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Layers className="text-green-300" size={20} />
          Course Modules
        </h2>

        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle size={18} />
          Add Module
        </Button>
      </div>

      {/* Empty state */}
      {modules.length === 0 ? (
        <div className="border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl p-10 text-center text-gray-300">
          <Layers className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm">
            No modules yet. Add your first one to begin structuring this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="border border-white/20 bg-white/10 backdrop-blur-xl rounded-xl p-4 transition-all hover:bg-white/15"
            >
              {/* Module header */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(mod.id)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-yellow-300" />
                    {mod.title}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {mod.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditModule?.(mod.id)
                    }}
                  >
                    <Pencil size={14} />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-500/20 text-red-300 border-red-400/40 hover:bg-red-500/30"
                    disabled={deleting === mod.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(mod.id)
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>

                  {expandedModule === mod.id ? (
                    <ChevronUp size={20} className="text-gray-300" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-300" />
                  )}
                </div>
              </div>

              {/* Expanded Lessons Section */}
              <AnimatePresence initial={false}>
                {expandedModule === mod.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4 pl-6"
                  >
                    <LessonList
                      courseSlug={courseSlug}
                      moduleId={mod.id}
                      lessons={mod.lessons || []}
                      onDeleteLesson={handleDeleteLesson}
                    />

                    {/* 🟢 Redirect to full Add Lesson Page */}
                    <Button
                      onClick={() =>
                        router.push(
                          `/staff/courses/${courseSlug}/modules/${mod.id}/lessons/new`
                        )
                      }
                      size="sm"
                      className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      <PlusCircle size={14} />
                      Add Lesson
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ➕ Add Module Modal */}
      <ModuleAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        courseSlug={courseSlug}
        onModuleCreated={onRefreshModules}
      />
    </section>
  )
}
