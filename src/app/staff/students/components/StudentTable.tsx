'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Search, Eye } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api' // ✅ your existing fetch helper

type StudentRow = {
  id: string
  user: {
    name: string
    email: string
  }
  course: {
    title: string
  }
  progress: number
  enrolledAt: string
}

export default function StudentTable() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [sortAsc, setSortAsc] = useState(true)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // ✅ Fetch real student data
  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await api.get('enrollments')
        setStudents(data || [])
      } catch (error) {
        console.error('Failed to load students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleSort = () => {
    const sorted = [...students].sort((a, b) => {
      const nameA = a.user?.name || ''
      const nameB = b.user?.name || ''
      return sortAsc
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    })
    setStudents(sorted)
    setSortAsc(!sortAsc)
  }

  const filtered = students.filter((s) => {
    const name = s.user?.name?.toLowerCase() || ''
    const email = s.user?.email?.toLowerCase() || ''
    const course = s.course?.title?.toLowerCase() || ''
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q) || course.includes(q)
  })

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Loading students...</div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Enrolled Students 👩‍🎓</h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer select-none"
                onClick={handleSort}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortAsc ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Course</th>
              <th scope="col" className="px-6 py-3">Progress</th>
              <th scope="col" className="px-6 py-3">Joined</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((student) => (
                <tr
                  key={student.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.user?.name || '—'}
                  </td>
                  <td className="px-6 py-4">{student.user?.email || '—'}</td>
                  <td className="px-6 py-4">{student.course?.title || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${student.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {student.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/staff/students/${student.id}`}
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <Eye size={16} /> View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
