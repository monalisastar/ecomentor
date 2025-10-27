'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

type CourseCardProps = {
  course: any
  isEnrolled: boolean
  actionButton?: ReactNode
}

export default function CourseCard({ course, isEnrolled, actionButton }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
      {/* 📸 Thumbnail */}
      <div className="relative w-full h-40 mb-4">
        <Image
          src={course.image || '/images/default-course.jpg'}
          alt={course.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* 🧠 Title & Description */}
      <h3 className="font-semibold text-lg mb-2 text-gray-800">{course.title}</h3>
      <p className="text-gray-600 text-sm flex-grow line-clamp-3">
        {course.description || 'No description available.'}
      </p>

      {/* ⚡ Buttons */}
      <div className="mt-4 space-y-2">
        {actionButton ? (
          actionButton
        ) : isEnrolled ? (
          <Link
            href={`/student/courses/${course.slug}`}
            className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
          >
            ✅ Continue Learning
          </Link>
        ) : (
          <Link
            href={`/student/courses/${course.slug}/enroll`}
            className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Enroll Now
          </Link>
        )}

        <Link
          href={`/student/courses/${course.slug}`}
          className="block text-center text-green-600 font-semibold hover:underline"
        >
          View →
        </Link>
      </div>
    </div>
  )
}
