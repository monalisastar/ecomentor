'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import CourseModal from './CourseModal'

export type Course = {
  id: string
  title: string
  slug: string
  description: string
  unlockWithAERA?: number
}

export default function CourseTable({ courses: initialCourses = [], refreshCourses }: any) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ Fetch courses (if not passed from parent)
  useEffect(() => {
    if (initialCourses.length === 0) {
      fetchCourses()
    }
  }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
      const data = await apiRequest('courses')
      setCourses(data)
    } catch (err) {
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  // ➕ Add new course
  const handleAddCourse = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  // 📝 Edit existing course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  // 🗑️ Delete course (API)
  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await apiRequest(`courses/${id}`, 'DELETE')
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting course:', err)
      alert('Failed to delete course')
    }
  }

  // 💾 Save (add or edit) → backend sync
  const handleSaveCourse = async (data: Omit<Course, 'id'>) => {
    try {
      if (editingCourse) {
        const updated = await apiRequest(`courses/${editingCourse.id}`, 'PATCH', data)
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? updated : c))
        )
      } else {
        const created = await apiRequest('courses', 'POST', data)
        setCourses((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Error saving course:', err)
      alert('Failed to save course')
    }
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">All Courses</h2>
        <button
          onClick={handleAddCourse}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={18} />
          Add Course
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-gray-500 text-sm p-4">Loading courses...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Title</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Slug</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Description</th>
                <th className="text-center text-sm font-medium text-gray-700 px-4 py-3">AERA</th>
                <th className="text-center text-sm font-medium text-gray-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-green-700 hover:text-green-900">
                    <Link href={`/staff/courses/${course.slug}`}>{course.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 line-clamp-2 max-w-xs">{course.description}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {course.unlockWithAERA ? `${course.unlockWithAERA} AERA` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEditCourse(course)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">
                    No courses available. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <CourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
      />
    </div>
  )
}
