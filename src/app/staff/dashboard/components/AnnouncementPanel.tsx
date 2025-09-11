'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Trash, Eye, Clock } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  course: string
  date: string
  status: 'Draft' | 'Published' | 'Scheduled'
}

interface AnnouncementPanelProps {
  announcements: Announcement[]
}

export default function AnnouncementPanel({ announcements }: AnnouncementPanelProps) {
  const router = useRouter()

  const statusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500'
      case 'Draft': return 'bg-yellow-500'
      case 'Scheduled': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead className="bg-green-50">
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Course</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map(a => (
            <tr key={a.id} className="border-b hover:bg-green-50 transition">
              <td className="px-4 py-2 font-medium text-green-800">{a.title}</td>
              <td className="px-4 py-2">{a.course}</td>
              <td className="px-4 py-2">{a.date}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-white text-xs ${statusColor(a.status)}`}>
                  {a.status}
                </span>
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => router.push(`/staff/announcements/${a.id}/edit`)}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center space-x-1 hover:bg-blue-700 transition"
                >
                  <Pencil size={14} /> <span>Edit</span>
                </button>
                <button
                  onClick={() => router.push(`/staff/announcements/${a.id}`)}
                  className="px-3 py-1 rounded bg-gray-300 text-gray-700 text-sm flex items-center space-x-1 hover:bg-gray-400 transition"
                >
                  <Eye size={14} /> <span>View</span>
                </button>
                <button
                  onClick={() => alert('Delete feature coming soon!')}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm flex items-center space-x-1 hover:bg-red-600 transition"
                >
                  <Trash size={14} /> <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={() => router.push('/staff/announcements/new')}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          + Create New Announcement
        </button>
      </div>
    </div>
  )
}
