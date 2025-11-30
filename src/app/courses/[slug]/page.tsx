'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

type Lesson = { id: string; title: string }
type Module = { id: string; title: string; lessons?: Lesson[] }

interface Course {
  id: string
  title: string
  slug: string
  description: string
  image: string
  instructor?: string
  duration?: string
  level?: string
  rating?: number
  reviews?: number
  unlockWithAERA?: number
  simulatedUSD?: number
  discount?: number
  whatYouLearn?: string[]
  skills?: string[]
  tools?: string[]
  modules?: Module[]
}

export default function CourseSlugPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    const normalizedSlug = Array.isArray(slug) ? slug[0] : slug

    async function fetchCourse() {
      try {
        // ✅ FIXED ROUTE
        const res = await fetch(`/api/public/course/${normalizedSlug}`)
        if (!res.ok) throw new Error('Course not found')
        const data = await res.json()
        setCourse(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [slug])

  const handleEnroll = () => {
    if (!session) {
      router.push(`/login?redirect=/courses/${slug}`)
    } else {
      router.push(`/enroll/${slug}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading...
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        {error || 'Course not found'}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1e2e] via-[#133b52] to-[#0b1e2e] text-white px-6 py-20 md:px-12">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Hero Section */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-gray-300 max-w-3xl mb-6">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
              {course.level && <span className="bg-white/10 px-3 py-1 rounded">{course.level}</span>}
              {course.duration && <span className="bg-white/10 px-3 py-1 rounded">{course.duration}</span>}
              {course.rating && (
                <span className="bg-white/10 px-3 py-1 rounded">
                  ⭐ {course.rating.toFixed(1)} ({course.reviews || 0} reviews)
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.button
                onClick={handleEnroll}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                Enroll Now
              </motion.button>

              <div className="flex flex-wrap gap-2 text-sm">
                {course.unlockWithAERA && (
                  <span className="bg-yellow-600 px-3 py-1 rounded">
                    {course.unlockWithAERA} AERA
                  </span>
                )}
                {course.simulatedUSD && (
                  <span className="bg-blue-600 px-3 py-1 rounded">
                    ${course.simulatedUSD.toFixed(2)} USD
                  </span>
                )}
                {course.discount && (
                  <span className="bg-red-600 px-3 py-1 rounded">
                    {course.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        {course.whatYouLearn && (
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
              What You'll Learn
            </h2>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              {course.whatYouLearn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Skills */}
        {course.skills && (
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
              Skills You'll Gain
            </h2>
            <div className="flex flex-wrap gap-3">
              {course.skills.map((skill, i) => (
                <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-gray-200 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Tools */}
        {course.tools && (
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
              Tools You'll Learn
            </h2>
            <div className="flex flex-wrap gap-3">
              {course.tools.map((tool, i) => (
                <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-gray-200 text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Curriculum */}
        {course.modules && course.modules.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
              Course Curriculum
            </h2>
            <div className="space-y-3">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
                >
                  <h3 className="font-semibold text-lg mb-2">{mod.title}</h3>
                  {mod.lessons && (
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 pl-3">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id}>{lesson.title}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instructor */}
        {course.instructor && (
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
              Instructor
            </h2>
            <p className="text-gray-300">{course.instructor}</p>
          </section>
        )}

        {/* Footer */}
        <section className="border-t border-white/10 pt-8 text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Eco-Mentor. All rights reserved.</p>
        </section>
      </div>
    </main>
  )
}
