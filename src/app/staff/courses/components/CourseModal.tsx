'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'

type CourseFormData = {
  id?: string
  title: string
  slug: string
  description: string
  unlockWithAERA?: number
}

type CourseModalProps = {
  open: boolean
  onClose: () => void
  onSave: (course: CourseFormData) => void
  initialData?: CourseFormData | null
}

export default function CourseModal({
  open,
  onClose,
  onSave,
  initialData,
}: CourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    unlockWithAERA: undefined,
  })
  const [loading, setLoading] = useState(false)

  // ✨ If editing, prefill data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        unlockWithAERA: undefined,
      })
    }
  }, [initialData])

  // 🧩 Handle input change
  const handleChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 💾 Save handler (POST or PATCH)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('Please fill in the course title.')
      return
    }

    try {
      setLoading(true)

      // Auto-generate slug if missing
      const slug =
        formData.slug ||
        formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const payload = { ...formData, slug }

      let saved
      if (initialData?.id) {
        // 📝 Update course
        saved = await apiRequest(`courses/${initialData.id}`, 'PATCH', payload)
      } else {
        // ➕ Create new course
        saved = await apiRequest('courses', 'POST', payload)
      }

      onSave(saved)
      onClose()
    } catch (err) {
      console.error('Error saving course:', err)
      alert('Failed to save course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {initialData ? 'Edit Course' : 'Add New Course'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. GHG Accounting for Beginners"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Slug (URL-friendly)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                handleChange(
                  'slug',
                  e.target.value.toLowerCase().replace(/\s+/g, '-')
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. ghg-accounting"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder="Briefly describe this course..."
            />
          </div>

          {/* AERA unlock price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unlock with AERA (optional)
            </label>
            <input
              type="number"
              value={formData.unlockWithAERA ?? ''}
              onChange={(e) =>
                handleChange('unlockWithAERA', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. 50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
