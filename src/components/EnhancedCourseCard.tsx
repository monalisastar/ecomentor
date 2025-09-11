"use client"

import { useRouter } from "next/navigation"
import { EnhancedCourse } from "@/data/enhancedCourseData"
import { Users, Clock, Star, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

type LessonProgress = {
  id: string
  title: string
  completed: boolean
}

type ModuleProgress = {
  id: string
  title: string
  lessons: LessonProgress[]
}

type Props = {
  course: EnhancedCourse
  enrolled?: boolean
  rating?: number
  learners?: number
  duration?: string
  hasAERA?: boolean
  progress?: number // overall course progress
  modules?: ModuleProgress[] // optional real-time module progress
  onEnroll?: (slug: string) => void
  onClick?: () => void
}

export default function EnhancedCourseCard({
  course,
  enrolled = false,
  rating = 4.8,
  learners = 1200,
  duration = "6h",
  hasAERA = false,
  progress = 0,
  modules = [],
  onEnroll,
  onClick,
}: Props) {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [moduleProgress, setModuleProgress] = useState(modules)

  useEffect(() => {
    setModuleProgress(modules)
  }, [modules])

  const handleCardClick = () => onClick?.() ?? router.push(`/student/courses/${course.slug}`)

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!enrolled && onEnroll) onEnroll(course.slug)
    else handleCardClick()
  }

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation()
    alert(hasAERA ? `Unlocking ${course.title} with AERA` : `Unlocking ${course.title} with regular payment`)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setTilt({ rotateX: ((y - centerY) / centerY) * 7, rotateY: ((x - centerX) / centerX) * -7 })
    setMousePos({ x, y })
  }
  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 })
  const parallax = (factor: number) => ({ transform: `translateX(${(mousePos.x - 150) / factor}px) translateY(${(mousePos.y - 100) / factor}px)` })

  // Calculate overall progress if modules are provided
  const totalLessons = moduleProgress.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedLessons = moduleProgress.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)
  const computedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress

  return (
    <div
      ref={cardRef}
      className="relative group border rounded-lg shadow hover:shadow-2xl transition-transform transform cursor-pointer overflow-hidden bg-white dark:bg-slate-800"
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `perspective(600px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` }}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
          style={parallax(40)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-t-lg" />
      </div>

      {/* Course Info */}
      <div className="p-4 space-y-3 relative">
        <h3 className="font-semibold text-lg">{course.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{course.description}</p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap text-xs mt-1">
          {course.isNew && <span className="bg-green-600 text-white px-2 py-0.5 rounded-full">New</span>}
          {course.popular && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>}
          {course.recommended && <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full">Recommended</span>}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {learners.toLocaleString()} learners</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {duration}</span>
        </div>

        {/* Enroll / Progress */}
        {!enrolled ? (
          <div className="mt-4 relative flex flex-col items-center gap-2">
            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white relative z-10" onClick={handleEnrollClick} style={parallax(30)}>Enroll</Button>
            <Button size="sm" variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-100 absolute top-0 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20" onClick={handleUnlock} style={parallax(25)}>
              <Lock size={14} className="mr-1" /> Unlock
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${computedProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{computedProgress}% completed ({completedLessons}/{totalLessons} lessons)</p>

            {/* Modules & Lessons Progress */}
            {moduleProgress.map((mod) => {
              const modCompleted = mod.lessons.filter(l => l.completed).length
              const modPercent = Math.round((modCompleted / mod.lessons.length) * 100)
              return (
                <div key={mod.id} className="mt-1">
                  <p className="text-xs font-semibold">{mod.title} - {modPercent}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${modPercent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
