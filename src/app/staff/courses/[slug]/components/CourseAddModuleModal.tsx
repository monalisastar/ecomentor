'use client'

import { X, Loader2, PlusCircle } from "lucide-react"

export default function CourseAddModuleModal({
  show,
  onClose,
  newModuleTitle,
  setNewModuleTitle,
  onAdd,
  creating,
}: {
  show: boolean
  onClose: () => void
  newModuleTitle: string
  setNewModuleTitle: (v: string) => void
  onAdd: () => Promise<void>
  creating: boolean
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md space-y-5 relative">
        {/* ✖️ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* 🧩 Header */}
        <h3 className="text-lg font-semibold text-gray-800">
          Add New Module
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the module title to create a new section for this course.
        </p>

        {/* 📝 Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Title
          </label>
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="e.g. Introduction to Carbon Markets"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* 🚀 Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={onAdd}
            disabled={creating}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 transition"
          >
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <PlusCircle size={16} /> Add Module
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
