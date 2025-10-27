'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react'

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
  completedLessons?: string[] // ✅ new prop for tracking completed lessons
}

export default function CourseSidebar({
  modules,
  onSelectLesson,
  activeLessonId,
  completedLessons = [],
}: SidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>([])

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  // 🧠 Auto-expand first module for better UX
  useEffect(() => {
    if (modules.length > 0 && openModules.length === 0) {
      setOpenModules([modules[0].id])
    }
  }, [modules])

  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 rounded-lg md:rounded-none shadow-sm overflow-y-auto h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {modules?.length > 0 ? (
          modules.map((module) => (
            <div key={module.id}>
              {/* 📘 Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-800">{module.title}</span>
                {openModules.includes(module.id) ? (
                  <ChevronDown size={18} className="text-gray-500" />
                ) : (
                  <ChevronRight size={18} className="text-gray-500" />
                )}
              </button>

              {/* 🎯 Lessons */}
              {openModules.includes(module.id) && (
                <div className="pl-6 pr-3 pb-2 space-y-2">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map((lesson) => {
                      const isActive = activeLessonId === lesson.id
                      const isCompleted = completedLessons.includes(lesson.id)

                      return (
                        <button
                          key={lesson.id}
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
                                className="text-green-600 flex-shrink-0"
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
          ))
        ) : (
          <div className="p-4 text-sm text-gray-400 italic">
            No modules available yet.
          </div>
        )}
      </div>
    </aside>
  )
}
