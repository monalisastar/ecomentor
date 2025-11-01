'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Module } from '@/types/course'

type ModuleModalProps = {
  open: boolean
  onClose: () => void
  onSave: (data: Module) => void | Promise<void> // ✅ returns full module
  initialData?: { id?: string; title: string; description?: string } | null
  courseId?: string
}

/**
 * 📘 ModuleModal — Add or Edit Course Modules
 * -------------------------------------------------------
 * - Handles creation or editing of modules in Eco-Mentor LMS.
 * - On creation, returns the full saved Module to trigger LessonEditor.
 */
export default function ModuleModal({
  open,
  onClose,
  onSave,
  initialData,
  courseId,
}: ModuleModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)

  // 🧠 Prefill values when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [initialData, open])

  if (!open) return null

  // 💾 Save Module (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Please enter a module title.')
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
    }

    try {
      setSaving(true)
      setProgress(25)

      let saved: Module | null = null

      // 🧩 Create or Update via API
      if (initialData?.id) {
        saved = await apiRequest(`modules/${initialData.id}`, 'PATCH', payload)
      } else if (courseId) {
        saved = await apiRequest('modules', 'POST', { ...payload, courseId })
      }

      if (!saved) throw new Error('Module not saved.')

      setProgress(100)
      await onSave(saved) // ✅ Send the full module object to parent
      onClose()
    } catch (err) {
      console.error('❌ Error saving module:', err)
      alert('Failed to save module.')
    } finally {
      setTimeout(() => {
        setSaving(false)
        setProgress(0)
      }, 500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn border border-gray-100">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>

        {/* 🧭 Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Module' : 'Add New Module'}
          </h2>
          <p className="text-sm text-gray-500">
            {initialData
              ? 'Update the module details below.'
              : 'Create a new module and define its learning scope.'}
          </p>
        </div>

        {/* 🧾 Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fundamentals of GHG Accounting"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this module covers..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Progress Bar (shows during save) */}
          {saving && (
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-600 h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* 🎛️ Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {initialData ? 'Save Changes' : 'Add Module'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
