'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration?: string
  completed?: boolean
}

interface Module {
  id: string
  title: string
  lessons?: Lesson[]
}

interface SidebarProps {
  modules: Module[]
  onSelectLesson: (lesson: Lesson) => void
  activeLessonId?: string
  completedLessons?: string[]
}

/**
 * 📚 CourseSidebar
 * ----------------------------------------------------------
 * - Displays modules and lessons
 * - Highlights completed lessons based on ProgressRecord
 * - Auto-scrolls to active lesson
 */
export default function CourseSidebar({
  modules,
  onSelectLesson,
  activeLessonId,
  completedLessons = [],
}: SidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>([])
  const activeLessonRef = useRef<HTMLButtonElement | null>(null)

  // ✅ Accordion toggle with persistence
  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const updated = prev.includes(id) ? [] : [id]
      localStorage.setItem('openModules', JSON.stringify(updated))
      return updated
    })
  }

  // 🧠 Load saved open modules
  useEffect(() => {
    const saved = localStorage.getItem('openModules')
    if (saved) {
      setOpenModules(JSON.parse(saved))
    } else if (modules.length > 0) {
      setOpenModules([modules[0].id])
    }
  }, [modules])

  // 🎯 Auto-open the module containing the active lesson
  useEffect(() => {
    if (!activeLessonId || modules.length === 0) return
    const activeModule = modules.find((m) =>
      m.lessons?.some((l) => l.id === activeLessonId)
    )
    if (activeModule && !openModules.includes(activeModule.id)) {
      setOpenModules([activeModule.id])
      localStorage.setItem('openModules', JSON.stringify([activeModule.id]))
    }
  }, [activeLessonId, modules])

  // 🎯 Auto-scroll active lesson into view
  useEffect(() => {
    if (activeLessonRef.current) {
      activeLessonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeLessonId])

  // 🧮 Calculate per-module progress
  const getModuleProgress = (module: Module) => {
    const total = module.lessons?.length || 0
    const completed = module.lessons?.filter((l) =>
      completedLessons.includes(l.id)
    ).length || 0
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    const isComplete = total > 0 && completed === total
    return { completed, total, percent, isComplete }
  }

  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 rounded-lg md:rounded-none shadow-sm overflow-y-auto h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {modules?.length > 0 ? (
          modules.map((module) => {
            const { completed, total, percent, isComplete } = getModuleProgress(module)
            const isOpen = openModules.includes(module.id)

            return (
              <div key={module.id}>
                {/* 📘 Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex flex-col text-left px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{module.title}</span>
                      {isComplete && (
                        <span className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          <BadgeCheck size={12} className="mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-500" />
                    )}
                  </div>

                  {/* 🟩 Progress Bar + Stats */}
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {completed}/{total} lessons complete
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-green-600' : 'bg-green-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>

                {/* 🎯 Lessons List */}
                {isOpen && (
                  <div className="pl-6 pr-3 pb-2 space-y-2">
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson) => {
                        const isActive = activeLessonId === lesson.id
                        const isCompleted = completedLessons.includes(lesson.id)

                        return (
                          <button
                            key={lesson.id}
                            ref={isActive ? activeLessonRef : null}
                            onClick={() => onSelectLesson(lesson)}
                            className={`w-full flex items-center justify-between text-sm px-2 py-2 rounded-md transition ${
                              isActive
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle
                                  size={14}
                                  className="text-green-600 flex-shrink-0 animate-fadeIn"
                                />
                              ) : (
                                <PlayCircle
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {lesson.duration || '—'}
                            </span>
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-xs text-gray-400 pl-2 italic">
                        No lessons available
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-4 text-sm text-gray-400 italic">
            No modules available yet.
          </div>
        )}
      </div>
    </aside>
  )
}
