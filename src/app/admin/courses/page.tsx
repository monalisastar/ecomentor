'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as courseService from '@/services/api/courses'

type Course = {
  id: number
  title: string
  description: string
  lecturer: string
  status: 'draft' | 'pending' | 'published' | 'archived'
  price: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [newCourse, setNewCourse] = useState<Course>({
    id: Date.now(),
    title: '',
    description: '',
    lecturer: '',
    status: 'draft',
    price: '',
  })

  // Fetch pending courses for admin
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await courseService.getPendingCourses()
      setCourses(data)
    } catch (err) {
      console.error('Failed to fetch courses', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = async (courseId: string) => {
    try {
      await courseService.approveCourse(courseId)
      setCourses(prev =>
        prev.map(c =>
          c.id.toString() === courseId ? { ...c, status: 'published' } : c
        )
      )
    } catch (err) {
      console.error('Approval failed', err)
    }
  }

  const handleArchive = (id: number) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'archived' } : c))
    )
    // TODO: Add API call to archive
  }

  const handleEditSave = (updatedCourse: Course) => {
    setCourses(prev =>
      prev.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    )
    setEditingCourse(null)
  }

  const handleCreateSave = () => {
    setCourses(prev => [...prev, { ...newCourse, id: Date.now() }])
    setNewCourse({
      id: Date.now(),
      title: '',
      description: '',
      lecturer: '',
      status: 'draft',
      price: '',
    })
    setCreatingCourse(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📚 Manage Courses</h1>
        <button
          onClick={() => setCreatingCourse(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          ➕ Add Course
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 focus:outline-none text-white"
        />
      </div>

      {/* Courses Table */}
      <motion.div
        className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Lecturer</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filteredCourses.map(course => (
                <tr key={course.id} className="border-t border-white/10">
                  <td className="p-4">{course.title}</td>
                  <td className="p-4">{course.lecturer}</td>
                  <td className="p-4">{course.price}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-xl text-sm ${
                        course.status === 'published'
                          ? 'bg-green-500/30 text-green-300'
                          : course.status === 'pending'
                          ? 'bg-yellow-500/30 text-yellow-300'
                          : course.status === 'draft'
                          ? 'bg-blue-500/30 text-blue-300'
                          : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    {course.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(course.id.toString())}
                        className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {course.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(course.id)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Edit & Create Modals */}
      <CourseEditModal
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSave={handleEditSave}
      />
      <CourseCreateModal
        open={creatingCourse}
        onClose={() => setCreatingCourse(false)}
        course={newCourse}
        setCourse={setNewCourse}
        onSave={handleCreateSave}
      />
    </div>
  )
}

// ---------- MODAL COMPONENTS ----------

function CourseEditModal({
  course,
  onClose,
  onSave,
}: {
  course: Course | null
  onClose: () => void
  onSave: (course: Course) => void
}) {
  if (!course) return null
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">✏️ Edit Course</h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              onSave(course)
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={course.title}
              onChange={e =>
                onSave({ ...course, title: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            <textarea
              value={course.description}
              onChange={e =>
                onSave({ ...course, description: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white h-28"
            />
            <input
              type="text"
              value={course.price}
              onChange={e =>
                onSave({ ...course, price: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CourseCreateModal({
  open,
  onClose,
  course,
  setCourse,
  onSave,
}: {
  open: boolean
  onClose: () => void
  course: Course
  setCourse: (c: Course) => void
  onSave: () => void
}) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">➕ Add New Course</h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              onSave()
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Course Title"
              value={course.title}
              onChange={e => setCourse({ ...course, title: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            <textarea
              placeholder="Course Description"
              value={course.description}
              onChange={e =>
                setCourse({ ...course, description: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white h-28"
            />
            <input
              type="text"
              placeholder="Lecturer"
              value={course.lecturer}
              onChange={e => setCourse({ ...course, lecturer: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            <input
              type="text"
              placeholder="Price (e.g. $100)"
              value={course.price}
              onChange={e => setCourse({ ...course, price: e.target.value })}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
