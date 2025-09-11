'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MessageCircle, Eye } from 'lucide-react'
import { useSocket } from '@/context/SocketProvider'
import { useEffect, useState } from 'react'

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  course: string
  progress: number
}

interface StudentListProps {
  students: Student[]
}

export default function StudentList({ students: initial }: StudentListProps) {
  const router = useRouter()
  const { socket } = useSocket() // ✅ destructure socket
  const [students, setStudents] = useState<Student[]>(initial)

  // Handle real-time updates
  useEffect(() => {
    if (!socket) return // ⚡ wait until socket exists

    const handleCreated = (s: Student) => setStudents(prev => [s, ...prev])
    const handleUpdated = (s: Student) =>
      setStudents(prev => prev.map(st => (st.id === s.id ? s : st)))
    const handleDeleted = (id: string) =>
      setStudents(prev => prev.filter(st => st.id !== id))

    socket.on('student:created', handleCreated)
    socket.on('student:updated', handleUpdated)
    socket.on('student:deleted', handleDeleted)

    return () => {
      socket.off('student:created', handleCreated)
      socket.off('student:updated', handleUpdated)
      socket.off('student:deleted', handleDeleted)
    }
  }, [socket])

  const progressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!students.length) {
    return <p className="text-gray-500">No students enrolled.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead className="bg-green-50">
          <tr>
            <th className="px-4 py-2 text-left">Student</th>
            <th className="px-4 py-2 text-left">Course</th>
            <th className="px-4 py-2 text-left">Progress</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b hover:bg-green-50 transition">
              <td className="px-4 py-2 flex items-center space-x-3">
                {s.avatar ? (
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    {s.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-green-800">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </div>
              </td>
              <td className="px-4 py-2">{s.course}</td>
              <td className="px-4 py-2 w-1/4">
                <div className="w-full bg-green-100 rounded-full h-2" aria-label={`Progress ${s.progress}%`}>
                  <div
                    className={`h-2 rounded-full ${progressColor(s.progress)}`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{s.progress}%</p>
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => router.push(`/staff/students/${s.id}`)}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center space-x-1 hover:bg-blue-700 transition"
                >
                  <Eye size={14} /> <span>View</span>
                </button>
                <button
                  onClick={() => router.push(`/staff/students/${s.id}/message`)}
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm flex items-center space-x-1 hover:bg-green-700 transition"
                >
                  <MessageCircle size={14} /> <span>Message</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
