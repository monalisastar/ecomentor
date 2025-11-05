'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  courseId: string
  courseTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function CourseReviewModal({ courseId, courseTitle, onClose, onSuccess }: Props) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note before saving.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/admin/courses/${courseId}/review-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })

      if (!res.ok) throw new Error('Failed to save review note')

      toast.success('Review note saved successfully')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Review Course: <span className="text-green-700">{courseTitle}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Write a private admin note or feedback for this course.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="e.g., Please improve the quiz questions for module 2."
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-green-600 outline-none"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Note
          </button>
        </div>
      </div>
    </div>
  )
}
