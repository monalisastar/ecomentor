'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbHeaderProps {
  courseSlug?: string
  moduleId?: string
  currentLabel: string
}

export default function BreadcrumbHeader({
  courseSlug,
  moduleId,
  currentLabel,
}: BreadcrumbHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300 mb-6">
      {/* 🏫 Courses root */}
      <Link
        href="/staff/courses"
        className="hover:text-green-400 transition-colors font-medium"
      >
        Courses
      </Link>

      <ChevronRight size={14} className="text-gray-500" />

      {/* 📘 Specific course */}
      {courseSlug && (
        <>
          <Link
            href={`/staff/courses/${courseSlug}`}
            className="hover:text-green-400 transition-colors font-medium truncate max-w-[180px]"
          >
            {courseSlug.replace(/-/g, ' ')}
          </Link>
          <ChevronRight size={14} className="text-gray-500" />
        </>
      )}

      {/* 🧩 Specific module */}
      {moduleId && (
        <>
          <Link
            href={`/staff/courses/${courseSlug}/modules/${moduleId}`}
            className="hover:text-green-400 transition-colors font-medium"
          >
            Module
          </Link>
          <ChevronRight size={14} className="text-gray-500" />
        </>
      )}

      {/* ✳️ Current page label */}
      <span className="text-white font-semibold">{currentLabel}</span>
    </div>
  )
}
