'use client'

import { useMemo, useEffect, useState } from 'react'
import { FaBook, FaUserGraduate, FaClipboardList, FaCheckCircle } from 'react-icons/fa'
import { AiOutlineSearch } from 'react-icons/ai'
import Link from 'next/link'
import { useSocket } from '@/context/SocketProvider'
import { getCourses, enrollInCourse } from '@/services/api/courses'

interface Course {
  id: string
  title: string
  instructor: string
  category: string
  status: 'Active' | 'Draft' | 'Archived'
  students: number
}

export default function StudentCoursesPage() {
  const socket = useSocket()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<'title' | 'instructor' | 'category' | 'status' | 'students'>('title')
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (err) {
        console.error(err)
        alert('Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Socket real-time updates
  useEffect(() => {
    if (!socket) return

    socket.on('course:created', (course: Course) => {
      setCourses(prev => [course, ...prev])
    })

    socket.on('course:updated', (updated: Course) => {
      setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    })

    socket.on('course:deleted', (id: string) => {
      setCourses(prev => prev.filter(c => c.id !== id))
    })

    return () => {
      socket.off('course:created')
      socket.off('course:updated')
      socket.off('course:deleted')
    }
  }, [socket])

  // Filter + Sort
  const filteredCourses = useMemo(() => {
    return courses
      .filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let valA: string | number = a[sortColumn]
        let valB: string | number = b[sortColumn]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return sortAsc ? -1 : 1
        if (valA > valB) return sortAsc ? 1 : -1
        return 0
      })
  }, [courses, searchQuery, sortColumn, sortAsc])

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) setSortAsc(!sortAsc)
    else {
      setSortColumn(column)
      setSortAsc(true)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId)
      alert('Enrolled successfully!')
    } catch (err) {
      console.error(err)
      alert('Enrollment failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEFA] to-[#E0F7FF] text-gray-900 p-6">
      {/* Back to Dashboard */}
      <div className="mb-6">
        <Link href="/student/dashboard">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded shadow">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <FaBook size={24} />
            <p>Total Courses</p>
          </div>
          <p className="text-2xl font-bold mt-2">{courses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <FaUserGraduate size={24} />
            <p>My Enrollments</p>
          </div>
          <p className="text-2xl font-bold mt-2">{courses.reduce((acc, c) => acc + c.students, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <FaClipboardList size={24} />
            <p>Assignments</p>
          </div>
          <p className="text-2xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <FaCheckCircle size={24} />
            <p>Completed</p>
          </div>
          <p className="text-2xl font-bold mt-2">--</p>
        </div>
      </div>

      {/* Search + Courses Table */}
      <div className="mb-6">
        <div className="flex items-center mb-4 space-x-2">
          <AiOutlineSearch size={20} />
          <input
            type="text"
            placeholder="Search courses or instructors..."
            className="p-2 rounded border flex-1"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-700">Loading courses...</p>
        ) : paginatedCourses.length === 0 ? (
          <p className="text-center text-gray-700">No courses available.</p>
        ) : (
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-300">
                {['title', 'instructor', 'category', 'status', 'students'].map(col => (
                  <th
                    key={col}
                    className="p-2 border border-gray-200 cursor-pointer"
                    onClick={() => handleSort(col as any)}
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {sortColumn === col && (sortAsc ? ' ↑' : ' ↓')}
                  </th>
                ))}
                <th className="p-2 border border-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map(course => (
                <tr key={course.id} className="hover:bg-blue-100 transition">
                  <td className="p-2 border border-gray-200">{course.title}</td>
                  <td className="p-2 border border-gray-200">{course.instructor}</td>
                  <td className="p-2 border border-gray-200">{course.category}</td>
                  <td className="p-2 border border-gray-200">{course.status}</td>
                  <td className="p-2 border border-gray-200">{course.students}</td>
                  <td className="p-2 border border-gray-200">
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-400"
                    >
                      Enroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-400 hover:bg-blue-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">{currentPage} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-blue-400 hover:bg-blue-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
