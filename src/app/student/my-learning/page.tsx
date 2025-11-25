'use client'

import { useEffect, useState, useMemo } from 'react'
import LearningHeader from './components/LearningHeader'
import LearningFilterBar from './components/LearningFilterBar'
import LearningGrid from './components/LearningGrid'
import { apiRequest } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [progressFilter, setProgressFilter] = useState('All')
  const [certificationFilter, setCertificationFilter] = useState(false)

  // 🧠 Fetch enrollments
  useEffect(() => {
    async function fetchEnrollments() {
      try {
        setLoading(true)
        const data = await apiRequest('enrollments')

        const normalized = data.map((enrollment: any) => ({
          id: enrollment.id,
          courseId: enrollment.course?.id,
          title: enrollment.course?.title,
          // ✅ FIX: use correct field name “image” instead of “thumbnail”
          image: enrollment.course?.image || '/images/default-course.jpg',
          progress: enrollment.progress || 0,
          completed: enrollment.completed || false,
          slug: enrollment.course?.slug,
          description: enrollment.course?.description,
        }))

        setEnrollments(normalized)
      } catch (err: any) {
        console.error('Error fetching enrollments:', err)
        setError(err.message || 'Failed to load enrolled courses.')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  // 🧩 Filtering logic
  const filteredCourses = useMemo(() => {
    return enrollments.filter((course) => {
      const matchesSearch =
        query === '' ||
        course.title?.toLowerCase().includes(query.toLowerCase())

      const matchesProgress =
        progressFilter === 'All' ||
        (progressFilter === 'In Progress' && course.progress < 100) ||
        (progressFilter === 'Completed' && course.progress === 100)

      const matchesCertification =
        !certificationFilter || course.completed === true

      return matchesSearch && matchesProgress && matchesCertification
    })
  }, [query, progressFilter, certificationFilter, enrollments])

  // 💬 Error state
  if (error)
    return (
      <main className="flex items-center justify-center min-h-screen text-red-600">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl px-6 py-5 shadow-sm">
          <p className="font-semibold mb-1">Error loading data</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </main>
    )

  // 🌱 Main dashboard content
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* 🌿 Header */}
        <LearningHeader />

        {/* 🔍 Filter Bar */}
        <LearningFilterBar
          query={query}
          setQuery={setQuery}
          progressFilter={progressFilter}
          setProgressFilter={setProgressFilter}
          certificationFilter={certificationFilter}
          setCertificationFilter={setCertificationFilter}
        />

        {/* 📚 Enrolled Courses Grid */}
        <LearningGrid courses={filteredCourses} loading={loading} />
      </div>

      {/* ⏳ Global loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2
            size={34}
            className="animate-spin text-emerald-600 drop-shadow-sm"
          />
        </div>
      )}
    </main>
  )
}
