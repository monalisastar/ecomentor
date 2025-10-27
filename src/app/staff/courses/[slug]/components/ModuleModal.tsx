'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Module } from '@/types/course' // ✅ unified type import

type ModuleModalProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { title: string; description?: string }) => void | Promise<void> // ✅ async safe
  initialData?: { id?: string; title: string; description?: string } | null
  courseId?: string
}

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

  // Prefill when editing
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

      let saved: Module | null = null

      // 🔗 Create or update via backend API
      if (initialData?.id) {
        saved = await apiRequest(`modules/${initialData.id}`, 'PATCH', payload)
      } else if (courseId) {
        saved = await apiRequest('modules', 'POST', { ...payload, courseId })
      }

      await onSave(payload)
      onClose()
    } catch (err) {
      console.error('Error saving module:', err)
      alert('Failed to save module.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {initialData ? 'Edit Module' : 'Add New Module'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Module Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Renewable Energy"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              disabled={saving}
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
