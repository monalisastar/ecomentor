'use client'

import { PlayCircle, Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type EnrolledCourseCardProps = {
  course: {
    id: string
    title: string
    image?: string
    slug?: string
    progress: number
    completed: boolean
    description?: string
  }
}

export default function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  // 🧠 Build a universal Supabase-safe image URL
  const imageUrl =
    course.image && course.image.startsWith('http')
      ? course.image
      : course.image
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${course.image}`
      : '/images/default-course.jpg'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1.5 overflow-hidden flex flex-col">
      {/* 🎞 Thumbnail */}
      <div className="relative group w-full h-44">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {course.completed && (
          <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Award size={12} /> Certified
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* 🧾 Course Info */}
      <div className="flex flex-col justify-between flex-1 p-5 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {course.description || 'Start learning and track your progress.'}
          </p>
        </div>

        {/* 📈 Progress */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                course.progress === 100 ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {course.progress === 100 ? 'Completed' : `${course.progress}% complete`}
          </p>
        </div>

        {/* ▶️ CTA */}
        <Link
          href={`/student/courses/${course.slug}`}
          className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <PlayCircle size={16} />
          {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  )
}
