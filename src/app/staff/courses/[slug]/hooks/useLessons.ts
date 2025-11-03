'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useLessons(moduleId: string) {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ Fetch lessons from backend
  const fetchLessons = async () => {
    if (!moduleId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/modules/${moduleId}/lessons`)
      if (!res.ok) throw new Error('Failed to fetch lessons')
      const data = await res.json()
      setLessons(data)
    } catch (err: any) {
      toast.error(err.message || 'Error fetching lessons.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Delete lesson
  const deleteLesson = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      })
      if (!res.ok) throw new Error('Failed to delete lesson')
      toast.success('Lesson deleted successfully.')
      await fetchLessons()
    } catch (err: any) {
      toast.error(err.message || 'Error deleting lesson.')
    }
  }

  useEffect(() => {
    fetchLessons()
  }, [moduleId])

  return { lessons, loading, fetchLessons, deleteLesson }
}
