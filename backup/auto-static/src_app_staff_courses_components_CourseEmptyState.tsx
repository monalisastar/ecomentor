'use client'

import { BookOpen, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseEmptyStateProps {
  onCreateCourse?: () => void
}

export default function CourseEmptyState({ onCreateCourse }: CourseEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50/60">
      {/* 📚 Icon */}
      <div className="bg-green-100 text-green-700 rounded-full p-3 mb-4">
        <BookOpen size={36} />
      </div>

      {/* 🧭 Message */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        No courses found
      </h2>
      <p className="text-gray-600 text-sm max-w-md mb-6">
        You haven’t created any courses yet. Start by adding your first course to the Eco-Mentor catalog and inspire learners around the world.
      </p>

      {/* ➕ CTA */}
      {onCreateCourse && (
        <Button
          onClick={onCreateCourse}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <PlusCircle size={18} />
          Create Your First Course
        </Button>
      )}
    </div>
  )
}
