'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useAdminCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'ALL' })

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/courses', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses =
    filters.status === 'ALL'
      ? courses
      : courses.filter((c) => c.adminStatus === filters.status)

  return { courses: filteredCourses, loading, fetchCourses, filters, setFilters }
}
