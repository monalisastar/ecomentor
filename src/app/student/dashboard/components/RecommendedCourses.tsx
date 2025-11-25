'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  image?: string
  category?: string
}

export default function RecommendedCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await api.get('courses/recommended')
        setCourses(data || [])
      } catch (err) {
        console.error('Failed to load recommended courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-xl"></div>
          ))}
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No course recommendations available yet.</p>
        <p className="text-sm text-gray-400">
          Complete more lessons to unlock personalized suggestions!
        </p>
      </div>
    )
  }

  return (
    <motion.section
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        Recommended for You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="relative w-full h-40">
              <Image
                src={course.image || '/images/default-course.jpg'}
                alt={course.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="text-base font-semibold mb-1 text-gray-800 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {course.category || 'General'}
              </p>
              <Link
                href={`/student/courses/${course.slug}`}
                className="inline-block text-sm text-green-700 hover:text-green-800 font-medium"
              >
                View Course →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
