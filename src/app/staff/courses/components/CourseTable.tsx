'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, Pencil, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner' // ✅ add toast for feedback

interface Course {
  id: string
  title: string
  slug: string
  category?: string
  tier?: string
  scope?: string
  published?: boolean
  priceUSD?: number
  createdAt?: string
  updatedAt?: string
}

interface CourseTableProps {
  courses: Course[]
  onRefresh?: () => Promise<void> | void
}

export default function CourseTable({ courses, onRefresh }: CourseTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  // ✅ Updated delete logic
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      setDeleting(id)

      // ✅ Use query param instead of path param
      const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete course')
      }

      toast.success('🗑️ Course deleted successfully!')
      await onRefresh?.()
    } catch (error: any) {
      console.error('Error deleting course:', error)
      toast.error(error.message || '❌ Failed to delete course')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Scope</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Price (USD)</th>
            <th className="px-4 py-3">Last Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-all duration-150">
              <td className="px-4 py-3 font-medium text-gray-800">
                <Link
                  href={`/staff/courses/${course.slug}/edit`}
                  className="hover:text-green-700"
                >
                  {course.title}
                </Link>
              </td>

              <td className="px-4 py-3 text-gray-700">
                {course.category?.replace(/_/g, ' ') || '-'}
              </td>

              <td className="px-4 py-3 text-gray-700">
                {course.tier?.replace(/_/g, ' ') || '-'}
              </td>

              <td className="px-4 py-3 text-gray-700">{course.scope || '-'}</td>

              <td className="px-4 py-3">
                {course.published ? (
                  <span className="flex items-center text-green-700 font-medium">
                    <CheckCircle2 size={16} className="mr-1" />
                    Published
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 font-medium">
                    <Clock size={16} className="mr-1" />
                    Draft
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-gray-700">
                {course.priceUSD ? `$${course.priceUSD.toFixed(2)}` : '—'}
              </td>

              <td className="px-4 py-3 text-gray-500 text-xs">
                {course.updatedAt
                  ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })
                  : '—'}
              </td>

              <td className="px-4 py-3 text-right flex justify-end gap-2">
                <Link href={`/staff/courses/${course.slug}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-gray-700 hover:text-green-700"
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                </Link>

                <Link href={`/courses/${course.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-700"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  disabled={deleting === course.id}
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 size={14} />
                  {deleting === course.id ? 'Deleting…' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
