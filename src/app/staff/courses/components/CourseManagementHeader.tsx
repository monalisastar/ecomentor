'use client'

import { useRouter } from 'next/navigation'
import { PlusCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseManagementHeaderProps {
  title?: string
  description?: string
  onRefresh?: () => Promise<void> | void
  onCreateCourse?: () => void
}

export default function CourseManagementHeader({
  title = 'Course Management',
  description = 'Add, edit, or manage courses in the Eco-Mentor catalog.',
  onRefresh,
  onCreateCourse,
}: CourseManagementHeaderProps) {
  const router = useRouter()

  const handleCreate = () => {
    if (onCreateCourse) return onCreateCourse()
    router.push('/staff/courses/new')
  }

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* 🔹 Left: Title and description */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>

      {/* 🔸 Right: Actions */}
      <div className="flex gap-3">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </Button>
        )}

        <Button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <PlusCircle size={18} />
          Create Course
        </Button>
      </div>
    </header>
  )
}
