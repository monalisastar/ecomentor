'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { getMyCourses } from '@/services/api/courses'
import { motion } from 'framer-motion'

interface CourseProgress {
  id: string
  title: string
  thumbnail?: string
  description: string
  progress: number // module completion % + assignment bonus
  totalModules: number
  completedModules: number
  nextAssignmentDue?: string
  badges?: { id: string; name: string; icon?: string }[]
}

export default function ActiveCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  if (!session?.user?.id) redirect('/login')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await getMyCourses()

        const mapped = data.map((c: any) => {
          const totalModules = c.modules?.length || 0
          const completedModules = c.modules?.filter((m: any) =>
            m.completions?.some((comp: any) => comp.enrollmentId)
          ).length || 0

          const totalAssignments = c.assignments?.length || 0
          const completedAssignments = c.assignments?.filter((a: any) =>
            a.submissions?.some((s: any) => s.studentId === session.user.id)
          ).length || 0

          const moduleProgress = totalModules ? completedModules / totalModules : 0
          const assignmentProgress = totalAssignments ? completedAssignments / totalAssignments : 0
          const overallProgress = Math.round((moduleProgress + assignmentProgress) / 2 * 100)

          const nextAssignment = c.assignments
            ?.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .find((a: any) => !a.submissions?.some((s: any) => s.studentId === session.user.id))?.dueDate

          const badges = c.badges?.map((b: any) => ({ id: b.id, name: b.name, icon: b.icon }))

          return {
            id: c.id,
            title: c.title,
            thumbnail: c.thumbnail,
            description: c.shortDescription || c.description,
            progress: overallProgress,
            totalModules,
            completedModules,
            nextAssignmentDue: nextAssignment,
            badges,
          }
        })

        setCourses(mapped)
      } catch (err) {
        console.error('Failed to fetch courses', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [session?.user?.id])

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-sky-50 to-emerald-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="backdrop-blur-sm bg-white/40 rounded-xl p-4">
            <h1 className="text-2xl font-semibold text-gray-900">My Active Courses</h1>
            <p className="mt-1 text-sm text-gray-700">
              Track your enrolled courses and monitor progress in real-time.
            </p>
          </div>
        </header>

        {/* Search */}
        <section className="mb-6">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 w-full rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </section>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center text-gray-600">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center text-gray-600">No active courses found.</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.03 }}
                className="rounded-xl backdrop-blur-sm bg-white/40 p-4 shadow-md border border-white/30 flex flex-col justify-between transition-transform"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                <p className="text-sm text-gray-700 mt-1 mb-3">{course.description}</p>

                {/* Progress Chart */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-3 bg-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* Next Assignment */}
                {course.nextAssignmentDue && (
                  <p className="text-xs text-red-600 mb-3">
                    Next Assignment Due:{' '}
                    {new Date(course.nextAssignmentDue).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}

                {/* Badges */}
                {course.badges && course.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.badges.map(b => (
                      <div key={b.id} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {b.icon && <img src={b.icon} alt={b.name} className="w-4 h-4 rounded-full" />}
                        {b.name}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <a
                    href={`/student/dashboard/courses/${course.id}`}
                    className="flex-1 text-center px-3 py-2 rounded bg-emerald-600 text-white hover:opacity-95 text-sm"
                  >
                    Go to Course
                  </a>
                  <a
                    href={`/student/dashboard/assignments?course=${course.id}`}
                    className="flex-1 text-center px-3 py-2 rounded border border-gray-300 text-sm hover:bg-white/20"
                  >
                    View Assignments
                  </a>
                </div>
              </motion.div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
