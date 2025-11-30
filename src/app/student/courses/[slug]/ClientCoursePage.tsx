'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiRequest } from '@/lib/api'
import { toast } from 'sonner'

import CourseSidebar from './components/CourseSidebar'
import CourseVideoPlayer from './components/CourseVideoPlayer'
import CourseTabs from './components/CourseTabs'
import LessonNextButton from './components/LessonNextButton'
import LessonQuizPanel from './components/LessonQuizPanel'

// 🧩 Helper — Check lesson progress from backend
async function fetchLessonProgress(lessonId: string) {
  try {
    const res = await fetch(`/api/progress-records?lessonId=${lessonId}`)
    if (!res.ok) return false
    const data = await res.json()
    const record = Array.isArray(data) ? data[0] : data
    return !!record?.isPassed
  } catch {
    return false
  }
}

export default function ClientCoursePage({ slug }: { slug: string }) {
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [certificateIssued, setCertificateIssued] = useState(false)

  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [currentPassed, setCurrentPassed] = useState(false)
  const [showQuizButton, setShowQuizButton] = useState(false)

  // 🧠 Fetch enrollment + course data
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/enrollments/${slug}`)
        const data = await res.json()

        if (res.status === 403) {
          window.location.href = `/student/courses/${slug}/enroll`
          return
        }
        if (!res.ok) throw new Error(data.error || 'Failed to load course')

        const fetchedCourse = data.course
        if (!fetchedCourse) throw new Error('Course data unavailable')

        setCourse(fetchedCourse)
        setEnrollmentId(data.id)
        setProgress(data.progress || 0)
        setModules(fetchedCourse.modules || [])

        // 🔁 Restore last active lesson
        const storedLessonId = localStorage.getItem(`activeLesson_${slug}`)
        const allLessons = fetchedCourse.modules?.flatMap((m: any) => m.lessons || []) || []
        const storedLesson = allLessons.find((l: any) => l.id === storedLessonId)
        setActiveLesson(storedLesson || allLessons[0] || null)

        // ✅ Fetch quiz progress records
        const progressRes = await fetch(`/api/progress-records?courseSlug=${slug}`)
        if (progressRes.ok) {
          const records = await progressRes.json()
          const passedLessons = records.filter((r: any) => r.isPassed).map((r: any) => r.lessonId)
          setCompletedLessons(passedLessons)
        }
      } catch (err: any) {
        console.error('Error loading course:', err)
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchCourseData()
  }, [slug])

  // 💾 Persist current lesson + verify progress from backend
  useEffect(() => {
    async function updateLessonStatus() {
      if (!activeLesson?.id) return

      localStorage.setItem(`activeLesson_${slug}`, activeLesson.id)
      setShowQuizButton(false)

      // 🧠 Always confirm from backend (persistent unlock)
      const passed = await fetchLessonProgress(activeLesson.id)
      setCurrentPassed(passed || completedLessons.includes(activeLesson.id))
    }

    updateLessonStatus()
  }, [activeLesson, completedLessons, slug])

  // ✅ Handle quiz passed → update backend, sidebar, and progress
  const handleQuizPassed = async (lessonId: string) => {
    try {
      // 1️⃣ Save to backend
      await fetch('/api/progress-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseSlug: slug,
          isPassed: true,
        }),
      })

      // 2️⃣ Refresh passed lessons
      const res = await fetch(`/api/progress-records?courseSlug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        const passedLessons = data.filter((r: any) => r.isPassed).map((r: any) => r.lessonId)
        setCompletedLessons(passedLessons)
        setCurrentPassed(true)

        // 3️⃣ Update progress %
        const totalLessons = modules.flatMap((m) => m.lessons || []).length
        const newProgress = Math.round((passedLessons.length / totalLessons) * 100)
        setProgress(newProgress)

        await apiRequest(`enrollments/${enrollmentId}`, 'PUT', {
          progress: newProgress,
          completed: newProgress === 100,
        })
      }
    } catch (err) {
      console.error('❌ handleQuizPassed failed:', err)
      toast.error('Failed to update progress.')
    }
  }

  // 🎥 Detect when video ends → show quiz button
  useEffect(() => {
    const video = document.querySelector('video')
    if (video) {
      const handleEnd = () => setShowQuizButton(true)
      video.addEventListener('ended', handleEnd)
      return () => video.removeEventListener('ended', handleEnd)
    }
  }, [activeLesson])

  // 🔁 Update progress when moving to next lesson
  async function handleLessonComplete(nextLesson: any) {
    if (!enrollmentId) return
    try {
      const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
      const completedCount =
        modules.flatMap((m) => m.lessons || []).findIndex((l) => l.id === nextLesson.id) + 1

      const newProgress = Math.min(Math.round((completedCount / totalLessons) * 100), 100)
      setProgress(newProgress)
      localStorage.setItem(`progress_${slug}`, String(newProgress))

      await apiRequest(`enrollments/${enrollmentId}`, 'PUT', {
        progress: newProgress,
        completed: newProgress === 100,
      })

      setActiveLesson(nextLesson)
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  // 🕐 Loading + Error
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading course...
      </div>
    )

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

  // ✅ Sanitize instructor data — avoid object render errors
  const instructor = {
    name:
      typeof course.instructor === 'object'
        ? course.instructor.name || 'Instructor coming soon'
        : course.instructor || 'Instructor coming soon',
    bio: course.instructorBio || 'Instructor details will be added soon.',
    avatar:
      (typeof course.instructor === 'object' && course.instructor.image) ||
      course.instructorAvatar ||
      '/images/default-instructor.webp',
  }

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
          completedLessons={completedLessons}
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

        {/* 🎯 Take Quiz Button */}
        {activeLesson?.id && showQuizButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-6"
          >
            <button
              onClick={() =>
                document
                  .getElementById('lesson-quiz-section')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition animate-pulse"
            >
              Take Lesson Quiz
            </button>
          </motion.div>
        )}

        {/* 📘 Tabs */}
        <CourseTabs
          about={activeLesson?.description || course.description || 'No description available.'}
          instructor={instructor}
          fileUrl={activeLesson?.fileUrl}
          fileName={activeLesson?.fileName}
        />

        {/* 🧩 Lesson Quiz */}
        {activeLesson?.id && course && (
          <LessonQuizPanel
            lessonId={activeLesson.id}
            courseSlug={slug}
            courseTitle={course.title}
            onQuizPassed={(lessonId) => {
              handleQuizPassed(lessonId)
              setCurrentPassed(true)
            }}
          />
        )}

        {/* ⏭️ Next Lesson */}
        {activeLesson && (
          <LessonNextButton
            currentLessonId={activeLesson.id}
            modules={modules}
            onNext={(nextLesson: any) => handleLessonComplete(nextLesson)}
            disabled={!currentPassed}
            completedLessons={completedLessons}
          />
        )}
      </div>

      {/* 🟩 Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  )
}
