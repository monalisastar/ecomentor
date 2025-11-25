'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '@/lib/api'

export interface Course {
  id: string
  title: string
  slug: string
  category?: string
  scope?: string
  published?: boolean
  priceUSD?: number
  instructorId?: string
  createdAt?: string
  updatedAt?: string
}

interface Filters {
  search: string
  category: string
  scope: string
  published: string
}

interface UseCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  refreshCourses: () => Promise<void>
  refetch: () => Promise<void>
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
}

/**
 * ✅ Custom hook to fetch and manage staff courses
 * Supports live filters for category, scope, and published status
 */
export default function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔹 Filters (for search, category, scope, status)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    scope: '',
    published: '',
  })

  // 🔹 Fetch courses with optional query params
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v)
      ).toString()

      const data = await apiRequest(`courses${query ? `?${query}` : ''}`)
      setCourses(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to load courses:', err)
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // 🔹 Auto-fetch when filters change
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // 🔹 Manual refresh
  const refreshCourses = useCallback(async () => {
    await fetchCourses()
  }, [fetchCourses])

  return {
    courses,
    loading,
    error,
    refreshCourses,
    refetch: refreshCourses,
    setCourses,
    filters,
    setFilters,
  }
}
