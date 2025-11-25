'use client'

import { useRouter } from 'next/navigation'
import CourseManagementHeader from './components/CourseManagementHeader'
import CourseFilters from './components/CourseFilters'
import CourseTable from './components/CourseTable'
import CourseEmptyState from './components/CourseEmptyState'
import useCourses from './hooks/useCourses' // ✅ Corrected import

export default function StaffCoursesPage() {
  const router = useRouter()
  const { courses, loading, error, refetch, filters, setFilters } = useCourses()

  return (
    <main className="p-6 pt-[88px] flex flex-col gap-6">
      {/* ✅ Header includes both refresh + create buttons */}
      <CourseManagementHeader
        onRefresh={refetch}
        onCreateCourse={() => router.push('/staff/courses/new')}
      />

      {/* 🔹 Filters */}
      <CourseFilters filters={filters} setFilters={setFilters} />

      {/* 🔹 Table / Empty / Loading States */}
      {loading && <p className="text-gray-500 text-sm">Loading courses...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        courses.length > 0 ? (
          <CourseTable courses={courses} onRefresh={refetch} />
        ) : (
          // ✅ Added the onCreateCourse handler so "Create First Course" button works
          <CourseEmptyState onCreateCourse={() => router.push('/staff/courses/new')} />
        )
      )}
    </main>
  )
}
