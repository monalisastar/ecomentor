'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import CourseStatusBadge from './CourseStatusBadge'
import CourseActions from './CourseActions'


interface Course {
  id: string
  title: string
  slug: string
  adminStatus: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
  published: boolean
  createdAt: string
  instructor?: {
    name?: string
    email?: string
  }
}

export default function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const coursesPerPage = 10

  // 🧠 Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/courses', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load courses')
      const data = await res.json()
      setCourses(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(courses.length / coursesPerPage)
  const displayedCourses = courses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  )

  return (
    <section className="bg-white rounded-lg shadow overflow-hidden mt-4">
      <table className="min-w-full">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Course Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Instructor</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Published</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Admin Review</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                <Loader2 className="animate-spin inline-block mr-2" />
                Loading courses...
              </td>
            </tr>
          ) : displayedCourses.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-400 italic"
              >
                No courses found
              </td>
            </tr>
          ) : (
            displayedCourses.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {c.title || 'Untitled Course'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-700">
                  {c.instructor?.name || 'Unknown'}{' '}
                  <span className="block text-gray-400 text-xs">
                    {c.instructor?.email}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {c.published ? 'Published' : 'Draft'}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm">
                  <CourseStatusBadge status={c.adminStatus} />
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <CourseActions course={c} onActionDone={fetchCourses} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {!loading && courses.length > coursesPerPage && (
        <div className="flex justify-between items-center p-4 text-sm border-t">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md ${
              page === 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Previous
          </button>
          <p className="text-gray-600">
            Page {page} of {totalPages}
          </p>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md ${
              page === totalPages
                ? 'bg-gray-200 text-gray-400'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
