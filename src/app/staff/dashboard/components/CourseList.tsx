'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Users, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSocket } from '@/context/SocketProvider'


interface Course {
  id: string
  title: string
  students: number
  status: 'Published' | 'Draft' | 'Archived'
  progress: number // % completion across students
}

interface CourseListProps {
  courses?: Course[] // optional now
}

export default function CourseList({ courses = [] }: CourseListProps) {
  const router = useRouter()
  const { socket } = useSocket()

  const [courseData, setCourseData] = useState<Course[]>(courses)

  const statusColor = (status: Course['status']) => {
    switch (status) {
      case 'Published':
        return 'bg-green-500'
      case 'Draft':
        return 'bg-yellow-500'
      case 'Archived':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleStudentUpdate = (updated: { courseId: string; students: number }) => {
      setCourseData((prev) =>
        prev.map((course) =>
          course.id === updated.courseId
            ? { ...course, students: updated.students }
            : course
        )
      )
    }

    socket.on('studentCountUpdate', handleStudentUpdate)

    return () => {
      socket.off('studentCountUpdate', handleStudentUpdate)
    }
  }, [socket])

  if (!courseData.length) {
    return <p className="text-gray-500">No courses available.</p>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courseData.map((course) => (
        <div
          key={course.id}
          className="p-4 rounded-xl shadow-md bg-white hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-green-800">{course.title}</h3>
            <span
              className={`px-2 py-1 rounded text-white text-xs ${statusColor(course.status)}`}
            >
              {course.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Students Enrolled: <span className="font-medium">{course.students}</span>
          </p>

          <div className="w-full bg-green-100 rounded-full h-2 mt-3" aria-label={`Course progress ${course.progress}%`}>
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Course Completion: {course.progress}%</p>

          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => router.push(`/staff/courses/${course.id}/edit`)}
              className="flex-1 px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center justify-center space-x-1 hover:bg-blue-700 transition"
            >
              <Pencil size={14} /> <span>Edit</span>
            </button>

            <button
              onClick={() => router.push(`/staff/courses/${course.id}/students`)}
              className="flex-1 px-3 py-1 rounded bg-green-600 text-white text-sm flex items-center justify-center space-x-1 hover:bg-green-700 transition"
            >
              <Users size={14} /> <span>Students</span>
            </button>

            <button
              onClick={() => router.push(`/courses/${course.id}`)}
              className="px-3 py-1 rounded bg-gray-300 text-gray-700 text-sm flex items-center justify-center space-x-1 hover:bg-gray-400 transition"
            >
              <Eye size={14} /> <span>View</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
