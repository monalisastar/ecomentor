"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getModuleById, completeModule } from "@/services/api/modules"
import { getCourseBySlug } from "@/services/api/courses" // you already have a getCourseBySlug API

type Lesson = {
  id: string
  title: string
  content: string
  completed: boolean
}

type Course = {
  slug: string
  title: string
  totalLessons: number
  completedLessons: number
}

export default function LessonDetailPage() {
  const { slug, lessonId } = useParams() as { slug: string; lessonId: string }
  const router = useRouter()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const lessonData = await getModuleById(lessonId)
        const courseData = await getCourseBySlug(slug)
        setLesson(lessonData)
        setCourse(courseData)
      } catch (err) {
        console.error(err)
        alert("Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, lessonId])

  const handleCompleteLesson = async () => {
    if (!lesson || !course) return
    setUpdating(true)
    try {
      const updated = await completeModule(lesson.id)
      setLesson({ ...lesson, completed: true })
      setCourse({ ...course, completedLessons: updated.completedLessons })
    } catch (err) {
      console.error(err)
      alert("Failed to update progress")
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !lesson || !course) return <p className="p-8">Loading...</p>

  const progressPercent = Math.round((course.completedLessons / course.totalLessons) * 100)

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <Progress value={progressPercent} className="h-2 rounded-full" />
      <p className="text-sm text-gray-500">
        {course.completedLessons} of {course.totalLessons} lessons completed ({progressPercent}%)
      </p>

      <div className="prose max-w-none mt-4">
        <p>{lesson.content}</p>
      </div>

      {!lesson.completed && (
        <Button
          onClick={handleCompleteLesson}
          disabled={updating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {updating ? "Updating..." : "Mark as Completed"}
        </Button>
      )}

      {lesson.completed && <p className="text-green-600 font-semibold">✅ Lesson Completed</p>}
    </main>
  )
}
