'use client'

import { ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface LessonNextButtonProps {
  currentLessonId: string
  modules: {
    id: string
    title: string
    lessons: { id: string; title: string }[]
  }[]
  onNext?: (nextLesson: { id: string; title: string }) => void
  completedLessons?: string[]
  disabled?: boolean
}

/**
 * 💡 Displays the "Continue to Next Lesson" button.
 * Instantly unlocks after quiz pass (backend verified).
 * Shows "course complete" message at the final lesson.
 */
export default function LessonNextButton({
  currentLessonId,
  modules,
  onNext,
  completedLessons = [],
  disabled = false,
}: LessonNextButtonProps) {
  const [showHint, setShowHint] = useState(false)

  // 🔍 Find next lesson in sequence
  let nextLesson: { id: string; title: string } | null = null
  let foundCurrent = false

  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (foundCurrent) {
        nextLesson = lesson
        break
      }
      if (lesson.id === currentLessonId) foundCurrent = true
    }
    if (nextLesson) break
  }

  // ✅ Unlock only if both backend (disabled=false) and record exist
  const isPassed = !disabled && completedLessons.includes(currentLessonId)

  // 🎓 End of course message
  if (!nextLesson && isPassed) {
    return (
      <motion.div
        className="mt-12 text-center text-gray-600 italic"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎓 You’ve reached the end of this course. Congratulations!
      </motion.div>
    )
  }

  const nextLessonUrl = nextLesson ? `/student/courses/lesson/${nextLesson.id}` : '#'

  const handleClick = () => {
    if (isPassed && nextLesson) {
      onNext?.(nextLesson)
    } else {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 2500)
    }
  }

  return (
    <motion.div
      className="mt-12 flex flex-col items-center md:items-end"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {nextLesson ? (
        <>
          {onNext ? (
            <button
              onClick={handleClick}
              disabled={!isPassed}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-base transition-all shadow-sm hover:shadow-md ${
                isPassed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isPassed ? (
                <>
                  Continue to Next Lesson <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Complete Quiz to Continue
                </>
              )}
            </button>
          ) : (
            <Link
              href={isPassed ? nextLessonUrl : '#'}
              onClick={(e) => {
                if (!isPassed) {
                  e.preventDefault()
                  setShowHint(true)
                  setTimeout(() => setShowHint(false), 2500)
                }
              }}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-base transition-all shadow-sm hover:shadow-md ${
                isPassed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isPassed ? (
                <>
                  Continue to Next Lesson <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Complete Quiz to Continue
                </>
              )}
            </Link>
          )}

          {showHint && (
            <motion.span
              className="text-sm text-red-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              ⚠️ Please complete and pass the quiz to unlock the next lesson.
            </motion.span>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center mt-6">
          Complete this lesson’s quiz to finish the course.
        </p>
      )}
    </motion.div>
  )
}
