'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import Image from 'next/image'

export default function EnrollCoursePage() {
  const { slug } = useParams()
  const router = useRouter()

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  // 🧠 Fetch course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        const res = await fetch(`/api/courses/${slug}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load course')
        setCourse(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error loading course')
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchCourse()
  }, [slug])

  // 💳 Handle Enroll Logic
  async function handleEnroll() {
    try {
      if (!course) return
      setEnrolling(true)

      // 🚨 If not free → redirect to payments page
      if (course.price && course.price > 0) {
        router.push(`/student/payments?course=${slug}&amount=${course.price}`)
        return
      }

      // ✅ If free → enroll directly
      const res = await apiRequest('enrollments', 'POST', {
        courseId: course.id,
        paymentMethod: 'free',
        paymentStatus: 'PAID',
        amountPaid: 0,
      })

      if (res.error) {
        alert(res.error)
        return
      }

      // 🎯 Redirect to course content
      router.push(`/student/courses/${slug}`)
    } catch (err) {
      console.error('Enrollment failed:', err)
      alert('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading course details...
      </div>
    )

  if (error || !course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <h2 className="text-3xl font-semibold mb-2">404 — Course Not Found</h2>
        <p className="mb-6">{error || 'This course does not exist.'}</p>
        <a
          href="/student/courses"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Courses
        </a>
      </div>
    )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-xl overflow-hidden">
        <Image
          src={course.image || '/images/default-course.jpg'}
          alt={course.title}
          width={1200}
          height={500}
          className="w-full h-64 object-cover"
        />

        <div className="p-8 text-center">
          <h1 className="text-3xl font-semibold mb-3 text-gray-900">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {course.description || 'Course description coming soon.'}
          </p>

          <p className="text-2xl font-semibold text-green-700 mb-8">
            {course.price && course.price > 0
              ? `KES ${course.price.toLocaleString()}`
              : 'Free'}
          </p>

          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className={`px-8 py-3 rounded-lg text-white font-medium transition ${
              enrolling
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {enrolling
              ? 'Processing...'
              : course.price && course.price > 0
              ? 'Proceed to Payment'
              : 'Enroll Now'}
          </button>
        </div>
      </div>
    </main>
  )
}
