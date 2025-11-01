'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { apiRequest } from '@/lib/api'

import CourseSidebar from './components/CourseSidebar'
import CourseVideoPlayer from './components/CourseVideoPlayer'
import CourseTabs from './components/CourseTabs'
import LessonNextButton from './components/LessonNextButton'

export default function CourseDetailPage() {
  const { slug } = useParams()

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // 🧠 Fetch enrollment and course data
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/enrollments/${slug}`)
        const data = await response.json()

        // 🚫 User not enrolled — redirect to enroll page
        if (response.status === 403) {
          window.location.href = `/student/courses/${slug}/enroll`
          return
        }

        // ❌ Error responses
        if (!response.ok) {
          setError(data.error || 'Failed to load course')
          return
        }

        // ✅ Enrolled user — populate data
        const fetchedCourse = data.course
        if (!fetchedCourse) {
          setError('Course data unavailable')
          return
        }

        setCourse(fetchedCourse)
        setEnrollmentId(data.id)
        setProgress(data.progress || 0)

        const fetchedModules = fetchedCourse.modules || []
        setModules(fetchedModules)

        const firstLesson = fetchedModules[0]?.lessons?.[0]
        if (firstLesson) setActiveLesson(firstLesson)
      } catch (err: any) {
        console.error('Error loading course:', err)
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchCourseData()
  }, [slug])

  // 🔁 Update progress when moving to next lesson
  async function handleLessonComplete(nextLesson: any) {
    if (!enrollmentId) return
    try {
      const totalLessons = modules.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0
      )
      const completedCount =
        modules.flatMap((m) => m.lessons || []).findIndex(
          (l) => l.id === nextLesson.id
        ) + 1

      const newProgress = Math.min(
        Math.round((completedCount / totalLessons) * 100),
        100
      )

      setProgress(newProgress)

      await apiRequest(`enrollments/${enrollmentId}`, 'PUT', {
        progress: newProgress,
        completed: newProgress === 100,
      })

      // Switch to next lesson
      setActiveLesson(nextLesson)
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  // ⏳ Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading course...
      </div>
    )

  // ❌ Error
  if (error || !course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <h2 className="text-3xl font-semibold mb-2">404 — Course Not Found</h2>
        <p className="mb-6">{error || 'This course does not exist.'}</p>
        <a
          href="/student/courses"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Courses
        </a>
      </div>
    )

  // 🎯 Instructor + resources
  const instructor = {
    name: course.instructor || 'Instructor coming soon',
    bio: course.instructorBio || 'Instructor details will be added soon.',
    avatar: course.instructorAvatar || '/images/default-instructor.jpg',
  }

  const resources =
    Array.isArray(course.resources) && course.resources.length > 0
      ? course.resources
      : [{ title: 'Course resources will appear here soon.', url: '#' }]

  // 🧭 Render Course Page
  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
      {/* 📱 Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white rounded-md p-2 shadow-md"
      >
        <Menu size={22} />
      </button>

      {/* 🧭 Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="md:hidden flex justify-end p-3 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-700 hover:text-green-700"
          >
            <X size={20} />
          </button>
        </div>

        <CourseSidebar
          modules={modules}
          onSelectLesson={(lesson) => {
            setActiveLesson(lesson)
            setSidebarOpen(false)
            handleLessonComplete(lesson)
          }}
          activeLessonId={activeLesson?.id}
        />
      </div>

      {/* 🎥 Main Content */}
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CourseVideoPlayer lesson={activeLesson} />

        <CourseTabs
          about={course.description || 'No description provided yet.'}
          instructor={instructor}
          resources={resources}
        />

        {activeLesson && (
          <LessonNextButton
            currentLessonId={activeLesson.id}
            modules={modules}
            onNext={(nextLesson: any) => handleLessonComplete(nextLesson)}
          />
        )}
      </div>

      {/* 🟩 Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  )
}
