'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LessonNextButtonProps {
  /** The currently active lesson ID */
  currentLessonId: string

  /** All course modules with their lessons */
  modules: {
    id: string
    title: string
    lessons: { id: string; title: string }[]
  }[]

  /**
   * Optional callback fired when the user clicks “Next Lesson”.
   * The parent (CourseDetailPage) uses this to:
   * - Update progress in the backend
   * - Move to the next lesson
   */
  onNext?: (nextLesson: { id: string; title: string }) => void
}

/**
 * Displays the "Continue to Next Lesson" button.
 * Finds the next lesson automatically and triggers onNext or navigates directly.
 */
export default function LessonNextButton({
  currentLessonId,
  modules,
  onNext,
}: LessonNextButtonProps) {
  // 🔍 Find the next lesson in sequence (across all modules)
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

  // 🎓 No next lesson = course complete
  if (!nextLesson)
    return (
      <div className="mt-8 text-center text-gray-500 italic">
        🎓 You’ve reached the end of this course. Congratulations!
      </div>
    )

  const nextLessonUrl = `/student/courses/lesson/${nextLesson.id}`

  return (
    <div className="mt-8 flex justify-end">
      {onNext ? (
        <button
          onClick={() => onNext(nextLesson!)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
        >
          Continue to Next Lesson <ArrowRight size={18} />
        </button>
      ) : (
        <Link
          href={nextLessonUrl}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
        >
          Continue to Next Lesson <ArrowRight size={18} />
        </Link>
      )}
    </div>
  )
}
