'use client'

import React, { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string | Date
  course: { id: string; title: string }
  submission: { grade?: number } | null
}

interface AssignmentsPageProps {
  assignments: Assignment[] | undefined
}

export default function AssignmentsPage({ assignments: initialAssignments }: AssignmentsPageProps) {
  const { data: session } = useSession()
  if (!session?.user?.id) redirect('/login')

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'dueDate' | 'status' | 'grade'>('dueDate')
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id)

  // Ensure assignments is always an array
  const assignments = initialAssignments ?? []

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.course.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortKey === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        if (sortKey === 'grade') return (b.submission?.grade ?? 0) - (a.submission?.grade ?? 0)
        if (sortKey === 'status') {
          const statusOrder = (a: Assignment) =>
            a.submission?.grade != null ? 0 : a.submission ? 1 : 2
          return statusOrder(a) - statusOrder(b)
        }
        return 0
      })
  }, [assignments, search, sortKey])

  const total = assignments.length
  const submitted = assignments.filter((a) => a.submission).length
  const overdue = assignments.filter((a) => !a.submission && new Date(a.dueDate) < new Date()).length

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-sky-50 to-emerald-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="backdrop-blur-sm bg-white/40 rounded-xl p-4">
            <h1 className="text-2xl font-semibold text-gray-900">Assignments Dashboard</h1>
            <p className="mt-1 text-sm text-gray-700">
              Track, submit, and complete your climate learning tasks.
            </p>
          </div>
        </header>

        {/* Progress Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 text-center shadow-md">
            <h3 className="text-gray-800 font-semibold">Total Assignments</h3>
            <p className="text-2xl font-bold text-green-700">{total}</p>
          </div>
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 text-center shadow-md">
            <h3 className="text-gray-800 font-semibold">Submitted</h3>
            <p className="text-2xl font-bold text-green-700">{submitted}</p>
          </div>
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 text-center shadow-md">
            <h3 className="text-gray-800 font-semibold">Overdue</h3>
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
          </div>
        </section>

        {/* Search & Sort */}
        <section className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by assignment or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 flex-1"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="p-2 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="status">Sort by Status</option>
            <option value="grade">Sort by Grade</option>
          </select>
        </section>

        {/* Assignment Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.length === 0 ? (
            <div className="backdrop-blur-sm bg-white/30 rounded-xl p-6 text-center">
              <p className="text-gray-700">No assignments found.</p>
            </div>
          ) : (
            filteredAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                expanded={expanded}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </section>
      </div>
    </main>
  )
}

// Assignment Card Component
function AssignmentCard({
  assignment,
  expanded,
  toggleExpand,
}: {
  assignment: Assignment
  expanded: string | null
  toggleExpand: (id: string) => void
}) {
  const due = new Date(assignment.dueDate)
  const now = new Date()
  const isOverdue = !assignment.submission && due < now
  const status = assignment.submission
    ? assignment.submission.grade != null
      ? 'Graded'
      : 'Submitted'
    : 'Not Submitted'

  const statusColor = () => {
    if (assignment.submission?.grade != null) return 'bg-green-50 text-green-800 border-green-100'
    if (isOverdue) return 'bg-red-50 text-red-700 border-red-100'
    if (status === 'Submitted') return 'bg-blue-50 text-sky-700 border-sky-100'
    return 'bg-gray-50 text-gray-700 border-gray-100'
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl backdrop-blur-sm bg-white/40 p-4 shadow-md border border-white/30 cursor-pointer flex flex-col justify-between"
      onClick={() => toggleExpand(assignment.id)}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-emerald-800 bg-emerald-100/50 px-2 py-1 rounded">
            {assignment.course.title}
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded ${
              isOverdue ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            Due: {due.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-gray-900">{assignment.title}</h3>

        <AnimatePresence>
          {expanded === assignment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-gray-700 text-sm"
            >
              <p>{assignment.description}</p>
              {assignment.submission?.grade != null && (
                <p className="mt-2 font-medium text-green-700">Grade: {assignment.submission.grade}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${statusColor()}`}>{status}</div>
        <a
          href={`/student/dashboard/assignments/${assignment.id}`}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-white/20"
        >
          View Details
        </a>
        <a
          href={`/student/dashboard/assignments/${assignment.id}#submit`}
          className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm hover:opacity-95"
        >
          Submit Work
        </a>
        {isOverdue && <div className="ml-auto text-sm font-medium text-red-600">Overdue</div>}
      </div>
    </motion.article>
  )
}
