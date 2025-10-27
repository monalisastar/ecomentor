'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

type StudentRowProps = {
  id: string
  name: string
  email: string
  course: string
  progress: number
  joinedAt: string
}

export default function StudentRow({
  id,
  name,
  email,
  course,
  progress,
  joinedAt,
}: StudentRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="px-6 py-4 font-medium text-gray-900">{name}</td>
      <td className="px-6 py-4">{email}</td>
      <td className="px-6 py-4">{course}</td>

      {/* Progress bar */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">{progress}%</span>
        </div>
      </td>

      <td className="px-6 py-4 text-gray-500">{joinedAt}</td>

      <td className="px-6 py-4 text-right">
        <Link
          href={`/staff/students/${id}`}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <Eye size={16} /> View
        </Link>
      </td>
    </tr>
  )
}
