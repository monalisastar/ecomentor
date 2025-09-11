'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Eye, CheckCircle, Clock } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  course: string
  status: 'Draft' | 'Published' | 'Submitted' | 'Graded'
  submissions: number
  totalStudents: number
  dueDate: string
}

interface AssignmentPanelProps {
  assignments: Assignment[]
}

export default function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  const router = useRouter()

  const statusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500'
      case 'Draft': return 'bg-yellow-500'
      case 'Submitted': return 'bg-blue-500'
      case 'Graded': return 'bg-green-700'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead className="bg-green-50">
          <tr>
            <th className="px-4 py-2 text-left">Assignment</th>
            <th className="px-4 py-2 text-left">Course</th>
            <th className="px-4 py-2 text-left">Submissions</th>
            <th className="px-4 py-2 text-left">Due Date</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id} className="border-b hover:bg-green-50 transition">
              <td className="px-4 py-2 font-medium text-green-800">{a.title}</td>
              <td className="px-4 py-2">{a.course}</td>
              <td className="px-4 py-2">
                {a.submissions}/{a.totalStudents}
                <div className="w-full bg-green-100 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${statusColor(a.status)}`}
                    style={{ width: `${(a.submissions / a.totalStudents) * 100}%` }}
                  />
                </div>
              </td>
              <td className="px-4 py-2">{a.dueDate}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-white text-xs ${statusColor(a.status)}`}>
                  {a.status}
                </span>
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => router.push(`/staff/assignments/${a.id}/edit`)}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center space-x-1 hover:bg-blue-700 transition"
                >
                  <Pencil size={14} /> <span>Edit</span>
                </button>
                <button
                  onClick={() => router.push(`/staff/assignments/${a.id}/submissions`)}
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm flex items-center space-x-1 hover:bg-green-700 transition"
                >
                  <CheckCircle size={14} /> <span>Grade</span>
                </button>
                <button
                  onClick={() => router.push(`/assignments/${a.id}`)}
                  className="px-3 py-1 rounded bg-gray-300 text-gray-700 text-sm flex items-center space-x-1 hover:bg-gray-400 transition"
                >
                  <Eye size={14} /> <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={() => router.push('/staff/assignments/new')}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          + Create New Assignment
        </button>
      </div>
    </div>
  )
}
