'use client'

import { Loader2, Pencil, Trash2, Eye, RefreshCw, PlusCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default function CourseModulesList({
  modules,
  fetchModules,
  loadingModules,
  onAddModule,
}: {
  modules: any[]
  fetchModules: () => Promise<void>
  loadingModules: boolean
  onAddModule: () => void
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📚 Course Modules
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onAddModule}
            className="text-green-700 hover:text-green-900 flex items-center gap-1 text-sm font-medium"
          >
            <PlusCircle size={16} /> Add Module
          </button>
          <button
            onClick={fetchModules}
            disabled={loadingModules}
            className="text-gray-600 hover:text-green-700 flex items-center gap-2 text-sm"
          >
            <RefreshCw
              className={loadingModules ? 'animate-spin' : ''}
              size={16}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* 📦 Loading State */}
      {loadingModules ? (
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Loader2 className="animate-spin" size={14} /> Loading modules...
        </p>
      ) : !Array.isArray(modules) || modules.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No modules yet. Use Auto-Import or add one manually.
        </p>
      ) : (
        <div className="space-y-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              {/* 🧩 Module Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{mod.title}</h3>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* 🧠 Lessons List */}
              {Array.isArray(mod.lessons) && mod.lessons.length > 0 ? (
                <ul className="space-y-2 pl-4">
                  {mod.lessons.map((lesson: any) => (
                    <li
                      key={lesson.id}
                      className="p-3 bg-white border rounded-md hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          {lesson.title}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                          <Eye size={12} /> Preview
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        <ReactMarkdown>{lesson.content}</ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm pl-4">No lessons found.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
