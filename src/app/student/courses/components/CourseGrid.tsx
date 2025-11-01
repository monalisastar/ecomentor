'use client'

import { Course } from '@/data/courseData'
import CourseCard from './CourseCard'
import Link from 'next/link'

type CourseGridProps = {
  courses: Course[]
  enrolledCourses: string[]
}

export default function CourseGrid({ courses, enrolledCourses }: CourseGridProps) {
  if (courses.length === 0)
    return (
      <p className="text-center text-gray-500 py-10">
        No courses found. Try adjusting your search or filters.
      </p>
    )

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => {
        const isEnrolled = enrolledCourses.includes(course.id)

        return (
          <CourseCard
            key={course.id || course.slug}
            course={course}
            isEnrolled={isEnrolled}
            actionButton={
              isEnrolled ? (
                <Link href={`/student/courses/${course.slug}`}>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                    Continue Learning
                  </button>
                </Link>
              ) : (
                <Link href={`/student/courses/${course.slug}/enroll`}>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Enroll Now
                  </button>
                </Link>
              )
            }
          />
        )
      })}
    </div>
  )
}
