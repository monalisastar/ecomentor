'use client'

import { useRouter } from 'next/navigation'
import { FileText, Video, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl?: string
  fileUrl?: string
  createdAt?: string
}

interface LessonListProps {
  courseSlug: string
  moduleId: string
  lessons: Lesson[]
  onDeleteLesson: (lessonId: string) => Promise<void>
}

export default function LessonList({
  courseSlug,
  moduleId,
  lessons,
  onDeleteLesson,
}: LessonListProps) {
  const router = useRouter()

  // 🟢 Empty state (no button)
  if (!lessons || lessons.length === 0) {
    return (
      <div className="border border-white/10 bg-white/5 rounded-md p-6 text-center text-gray-400 text-sm">
        <p>No lessons yet. Add one to start building this module.</p>
      </div>
    )
  }

  // 📋 Lesson list
  return (
    <ul className="space-y-3">
      {lessons.map((lesson) => (
        <li
          key={lesson.id}
          className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between transition hover:bg-white/10"
        >
          <div className="flex flex-col">
            <h4 className="text-white font-medium flex items-center gap-2">
              <FileText size={16} className="text-green-300" />
              {lesson.title}
            </h4>
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
              {lesson.description || 'No description provided.'}
            </p>
            <div className="flex gap-3 mt-2 text-sm text-gray-400">
              {lesson.videoUrl && (
                <span className="flex items-center gap-1">
                  <Video size={14} className="text-yellow-300" /> Video
                </span>
              )}
              {lesson.fileUrl && (
                <span className="flex items-center gap-1">
                  <FileText size={14} className="text-blue-300" /> Document
                </span>
              )}
            </div>
          </div>

          {/* 🧭 Action buttons */}
          <div className="flex gap-2 mt-3 sm:mt-0">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() =>
                router.push(
                  `/staff/courses/${courseSlug}/modules/${moduleId}/lessons/${lesson.id}`
                )
              }
            >
              <Eye size={14} />
              View
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/20 text-red-300 border-red-400/40 hover:bg-red-500/30"
              onClick={() => onDeleteLesson(lesson.id)}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
