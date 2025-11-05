'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  courseSlug?: string
  dueDate?: string
  isCompleted: boolean
  createdAt: string
}

export default function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/staff/tasks', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Loading tasks...
      </div>
    )

  if (error)
    return <p className="text-red-500 text-sm">Error: {error}</p>

  if (tasks.length === 0)
    return <p className="text-gray-500 text-sm">No upcoming tasks.</p>

  return (
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="border p-3 rounded-md bg-gray-50 hover:bg-white transition">
          <p className="font-medium text-gray-800">{task.title}</p>
          {task.courseSlug && (
            <p className="text-sm text-green-600">Course: {task.courseSlug}</p>
          )}
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
