'use client'

import { useState, useEffect } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import CourseStatsBar from './components/CourseStatsBar'
import CourseStatusBadge from './components/CourseStatusBadge'
import CourseActions from './components/CourseActions'

/**
 * ✅ Main Admin Courses Page
 */
export default function AdminCoursesPage() {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'>('ALL')

  return (
    <main className="p-6 pt-[88px] flex flex-col gap-6">
      {/* 🧭 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Course Management</h1>

        {/* 🔽 Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-green-700" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="ALL">All Courses</option>
            <option value="APPROVED">Approved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* 📊 Stats Bar */}
      <CourseStatsBar />

      {/* 📘 Course Table */}
      <CourseTableWrapper filter={filter} />
    </main>
  )
}

/**
 * ✅ Wrapper Component to re-render CourseTableFilter cleanly when filter changes
 */
function CourseTableWrapper({
  filter,
}: {
  filter: 'ALL' | 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
}) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div key={`${filter}-${refreshKey}`}>
      <CourseTableFilter filter={filter} onRefresh={() => setRefreshKey((k) => k + 1)} />
    </div>
  )
}

/**
 * ✅ CourseTableFilter - Handles Fetch + Filtering + Display
 */
function CourseTableFilter({
  filter,
  onRefresh,
}: {
  filter: 'ALL' | 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
  onRefresh: () => void
}) {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/courses', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      const filtered =
        filter === 'ALL'
          ? data
          : data.filter((c: any) => c.adminStatus === filter)
      setCourses(filtered)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [filter])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-green-700" />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center text-gray-500 italic py-10">
        No {filter === 'ALL' ? 'courses' : filter.toLowerCase().replace('_', ' ')} found.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
      <table className="min-w-full">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Course Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Instructor</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Published</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Admin Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c: any) => (
            <tr key={c.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{c.title}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {c.instructor?.name || 'Unknown'}
                <span className="block text-gray-400 text-xs">{c.instructor?.email}</span>
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
              <td className="px-4 py-3">
                <CourseStatusBadge status={c.adminStatus} />
              </td>
              <td className="px-4 py-3">
                <CourseActions course={c} onActionDone={fetchCourses} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
