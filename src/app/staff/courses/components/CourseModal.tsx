'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import UploadPanel from '@/components/UploadPanel'

type CourseFormData = {
  id?: string
  title: string
  description: string
  priceUSD?: number
  image?: string
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
    description: '',
    priceUSD: undefined,
    image: '',
  })
  const [loading, setLoading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  // Prefill form when editing existing course
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setUploadedUrl(initialData.image || null)
    } else {
      setFormData({ title: '', description: '', priceUSD: undefined, image: '' })
      setUploadedUrl(null)
    }
  }, [initialData])

  // Handle text field change
  const handleChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Save course data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return alert('Please enter a course title.')

    try {
      setLoading(true)

      // 🧠 Auto-slugify title
      const slug = formData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const payload = {
        title: formData.title,
        slug,
        description: formData.description,
        priceUSD: formData.priceUSD ?? 0,
        image: uploadedUrl || formData.image || '',
      }

      // Update or create
      let saved
      if (initialData?.id) {
        saved = await apiRequest(`courses/${initialData.id}`, 'PATCH', payload)
      } else {
        saved = await apiRequest('courses', 'POST', payload)
      }

      onSave(saved)
      onClose()
    } catch (err) {
      console.error('❌ Error saving course:', err)
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Title */}
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

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              value={formData.priceUSD ?? ''}
              onChange={(e) => handleChange('priceUSD', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. 49.99"
              step="0.01"
              min="0"
            />
          </div>

          {/* UploadPanel for Course Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <UploadPanel />
          </div>

          {/* Image Preview */}
          {uploadedUrl && (
            <div className="mt-3">
              <img
                src={uploadedUrl}
                alt="Course Preview"
                className="w-24 h-24 rounded-lg border border-gray-300 object-cover"
              />
            </div>
          )}

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
