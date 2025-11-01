'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { X, Save, Loader2, ImagePlus } from 'lucide-react'
import { apiRequest } from '@/lib/api'

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
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // ✨ Prefill if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setPreview(initialData.image || null)
    } else {
      setFormData({
        title: '',
        description: '',
        priceUSD: undefined,
        image: '',
      })
      setPreview(null)
    }
  }, [initialData])

  // 🧩 Handle text changes
  const handleChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 🖼 Handle image selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  // 💾 Save Course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('Please enter a course title.')
      return
    }

    try {
      setLoading(true)

      // 🧠 Auto slugify
      const slug = formData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      let imageUrl = formData.image

      // 📤 Upload image
      if (file) {
        const uploadForm = new FormData()
        uploadForm.append('file', file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        })

        if (!uploadRes.ok) throw new Error('Image upload failed')
        const { url } = await uploadRes.json()
        imageUrl = url
      }

      const payload = {
        title: formData.title,
        slug,
        description: formData.description,
        priceUSD: formData.priceUSD ?? 0,
        image: imageUrl,
      }

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

          {/* Price (USD) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              value={formData.priceUSD ?? ''}
              onChange={(e) =>
                handleChange('priceUSD', Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. 49.99"
              step="0.01"
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition">
                <ImagePlus size={18} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                />
              )}
            </div>
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
