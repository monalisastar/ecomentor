'use client'

import { useEffect, useState } from 'react'
import CourseTable from './components/CourseTable'
import { apiRequest } from '@/lib/api'

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔹 Fetch courses from API
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await apiRequest('courses') // ✅ GET /api/courses
        setCourses(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <main className="flex flex-col gap-6 p-6 pt-[88px] sm:pt-[96px] transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 text-sm">
            Add, edit, or remove courses from the Eco-Mentor catalog.
          </p>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <p className="text-gray-500 text-sm">Loading courses...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Courses Table */}
      {!loading && !error && (
        <section>
          <CourseTable
            courses={courses}
            refreshCourses={() => window.location.reload()}
          />
        </section>
      )}
    </main>
  )
}
