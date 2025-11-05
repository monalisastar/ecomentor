'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  category?: string
  adminStatus: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
  createdAt: string
  instructor?: { name?: string; email?: string }
}

export default function ReviewPanel() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/admin/courses/review', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load review courses')
        const data = await res.json()
        setCourses(data.courses || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  async function handleAction(courseId: string, action: 'APPROVED' | 'REVOKED') {
    try {
      const res = await fetch('/api/admin/courses/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, action }),
      })
      if (!res.ok) throw new Error('Failed to update status')

      toast.success(`Course ${action === 'APPROVED' ? 'approved' : 'revoked'} successfully`)
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, adminStatus: action } : c
        )
      )
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Loading course reviews...
      </div>
    )

  if (error)
    return <p className="text-red-600 text-sm">Error: {error}</p>

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Course Review & Moderation
      </h2>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-gray-500">
          No courses pending review.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="text-left py-2 px-4">Course Title</th>
                <th className="text-left py-2 px-4">Instructor</th>
                <th className="text-left py-2 px-4">Category</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-right py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 font-medium">{course.title}</td>
                  <td className="py-2 px-4">
                    {course.instructor?.name || 'Unknown'}
                    <span className="block text-xs text-gray-500">
                      {course.instructor?.email}
                    </span>
                  </td>
                  <td className="py-2 px-4">{course.category || '—'}</td>
                  <td className="py-2 px-4">
                    {course.adminStatus === 'UNDER_REVIEW' && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle size={14} /> Under Review
                      </span>
                    )}
                    {course.adminStatus === 'APPROVED' && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} /> Approved
                      </span>
                    )}
                    {course.adminStatus === 'REVOKED' && (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={14} /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {course.adminStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleAction(course.id, 'APPROVED')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    )}
                    {course.adminStatus !== 'REVOKED' && (
                      <button
                        onClick={() => handleAction(course.id, 'REVOKED')}
                        className="ml-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
