"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Clock, Users, Star, CheckCircle } from "lucide-react"
import { getCourseBySlug } from "@/services/api/courses"
import { getModulesByCourse, completeModule } from "@/services/api/modules"

type Lesson = {
  id: string
  title: string
  duration: string
  completed?: boolean
}

type Module = {
  id: string
  title: string
  lessons: Lesson[]
}

type CourseDetail = {
  slug: string
  title: string
  description: string
  image: string
  rating: number
  learners: number
  duration: string
  modules: Module[]
  enrolled: boolean
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function fetchData() {
      setLoading(true)
      try {
        const courseData = await getCourseBySlug(slug)
        const modulesData = await getModulesByCourse(courseData.id)
        setCourse({ ...courseData, modules: modulesData })
      } catch (err) {
        console.error(err)
        alert("Failed to fetch course")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) return <p className="text-center py-20">Loading course...</p>
  if (!course) return <p className="text-center py-20">Course not found.</p>

  const handleEnroll = async () => {
    try {
      await fetch(`/api/courses/${course.slug}/enroll`, { method: "POST" })
      setCourse({ ...course, enrolled: true })
    } catch (err) {
      console.error(err)
      alert("Enrollment failed")
    }
  }

  const handleLessonToggle = async (moduleId: string, lessonId: string) => {
    if (!course) return

    try {
      const updated = await completeModule(lessonId)
      const updatedModules = course.modules.map((mod) => {
        if (mod.id !== moduleId) return mod
        return {
          ...mod,
          lessons: mod.lessons.map((lesson) =>
            lesson.id !== lessonId ? lesson : { ...lesson, completed: true }
          ),
        }
      })
      setCourse({ ...course, modules: updatedModules })
    } catch (err) {
      console.error(err)
      alert("Failed to update lesson progress")
    }
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  )
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <main className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <img src={course.image} alt={course.title} className="w-full md:w-64 h-40 object-cover rounded-lg shadow-lg" />
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{course.description}</p>
          <div className="flex gap-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500"/> {course.rating.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Users size={14}/> {course.learners.toLocaleString()} learners</span>
            <span className="flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
          </div>
          {!course.enrolled && (
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEnroll}>
              Enroll Now
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {course.enrolled && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Progress: {progress}% ({completedLessons}/{totalLessons} lessons completed)</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Modules & Lessons */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {course.modules.map((mod) => (
              <AccordionItem key={mod.id} value={mod.id}>
                <AccordionTrigger>{mod.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <span
                          onClick={() => router.push(`/courses/${course.slug}/lessons/${lesson.id}`)}
                          className={`${lesson.completed ? "line-through text-gray-400" : ""}`}
                        >
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{lesson.duration}</span>
                          <CheckCircle
                            className={`cursor-pointer ${lesson.completed ? "text-emerald-600" : "text-gray-300 hover:text-emerald-500"}`}
                            onClick={() => handleLessonToggle(mod.id, lesson.id)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  )
}
