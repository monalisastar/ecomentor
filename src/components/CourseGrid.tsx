"use client"

import EnhancedCourseCard from "./EnhancedCourseCard"
import { EnhancedCourse } from "@/data/enhancedCourseData"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Optional type for modules/lessons progress
type LessonProgress = { id: string; title: string; completed: boolean }
type ModuleProgress = { id: string; title: string; lessons: LessonProgress[] }

type Props = {
  courses: EnhancedCourse[]
  query?: string
  onEnroll?: (slug: string) => void
}

export default function CourseGrid({ courses, query, onEnroll }: Props) {
  const router = useRouter()
  const [courseProgress, setCourseProgress] = useState<Record<string, ModuleProgress[]>>({})

  // Fetch real-time module/lesson progress for all courses
  useEffect(() => {
    async function fetchProgress() {
      const progressData: Record<string, ModuleProgress[]> = {}
      await Promise.all(
        courses.map(async (course) => {
          try {
            const res = await fetch(`/api/student/courses/${course.slug}/progress`)
            if (!res.ok) throw new Error("Failed to fetch progress")
            const data = await res.json()
            progressData[course.slug] = data.modules // expecting { modules: ModuleProgress[] }
          } catch (err) {
            console.error(`Failed to fetch progress for ${course.slug}`, err)
            progressData[course.slug] = []
          }
        })
      )
      setCourseProgress(progressData)
    }

    fetchProgress()
  }, [courses])

  if (courses.length === 0) {
    return (
      <p className="text-gray-500">
        {query ? `No courses found for "${query}".` : "No courses found."}
      </p>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, i) => (
        <EnhancedCourseCard
          key={course.slug || String(i)}
          course={course}
          enrolled={course.enrolled ?? false}
          progress={course.progress ?? 0}
          rating={course.rating ?? 4.5}
          learners={course.enrollments ?? 500}
          duration={course.duration ?? `${4 + Math.floor(Math.random() * 10)}h`}
          modules={courseProgress[course.slug] ?? []} // pass live module progress
          onEnroll={() => {
            if (onEnroll && !course.enrolled) onEnroll(course.slug)
          }}
          onClick={() => router.push(`/student/courses/${course.slug}`)}
        />
      ))}
    </div>
  )
}
