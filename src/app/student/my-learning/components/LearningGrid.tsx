'use client'

import EnrolledCourseCard from './EnrolledCourseCard'

type CourseType = {
  id: string
  title: string
  image?: string
  slug?: string
  progress: number
  completed: boolean
  description?: string
}

type Props = {
  courses: CourseType[]
  loading?: boolean
}

export default function LearningGrid({ courses, loading }: Props) {
  // 🩶 Skeleton loader placeholders
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse"
          >
            <div className="h-44 bg-gray-200 rounded-t-2xl" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
              <div className="h-8 w-1/2 bg-gray-200 rounded-lg mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 🩶 Empty state
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          No courses yet
        </h3>
        <p className="text-gray-500 max-w-md">
          You haven’t started any learning journeys yet. Once you enroll in a
          course, it will appear here.
        </p>
      </div>
    )
  }

  // ✅ Actual courses grid
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 transition-all">
      {courses.map((course) => (
        <EnrolledCourseCard key={course.id || course.slug} course={course} />
      ))}
    </div>
  )
}
