'use client'

import { PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl?: string
}

interface CourseVideoPlayerProps {
  lesson: Lesson | null
  onLessonComplete?: (lessonId: string) => void
  onVideoEnded?: () => void // ✅ used to trigger quiz reveal
}

export default function CourseVideoPlayer({
  lesson,
  onLessonComplete,
  onVideoEnded,
}: CourseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  // 🔁 Reset when switching lessons
  useEffect(() => {
    setHasCompleted(false)
    setIsPlaying(false)
  }, [lesson?.id])

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 rounded-xl text-gray-500">
        <p className="italic">Select a lesson from the sidebar to begin learning.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 🎥 Video Section */}
      <div className="relative w-full h-[400px] bg-black rounded-t-xl overflow-hidden">
        {lesson.videoUrl ? (
          <video
            key={lesson.id} // ensures reset when lesson changes
            src={lesson.videoUrl}
            controls
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              if (!hasCompleted) {
                setHasCompleted(true)
                onLessonComplete?.(lesson.id)
                onVideoEnded?.() // ✅ notify parent to show quiz
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white space-y-3">
            <PlayCircle size={64} className="text-gray-400" />
            <p className="text-gray-300 text-sm">No video available for this lesson.</p>
          </div>
        )}
      </div>

      {/* 🏷️ Lesson Title Only (removed duplicate description) */}
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900">{lesson.title}</h2>
      </div>
    </div>
  )
}
