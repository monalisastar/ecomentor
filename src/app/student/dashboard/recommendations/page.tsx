'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { getCourses, getUserProgress } from '@/services/api/courses'

interface Recommendation {
  id: string
  title: string
  thumbnail?: string
  description: string
  category: string
  level: string
  duration: number
  skillMatch?: number // 0–100
  badges?: string[] // badge names/icons
  progress?: number // progress % for animated ring
  trendingScore?: number // AI-powered trending
}

export default function RecommendationsPage() {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  if (!session?.user?.id) redirect('/login')

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)

        // Fetch all courses
        const courses = await getCourses()
        // Fetch user course completions & badges
        const userProgress = await getUserProgress(session.user.id)

        // Enrich courses with skill match %, progress, and badges
        const enriched: Recommendation[] = courses.map((c: any) => {
          const completedModules = userProgress.completedModules[c.id] || 0
          const totalModules = c.modules?.length || 1
          const progress = Math.round((completedModules / totalModules) * 100)

          // Skill match: overlap of user's badges vs course tags
          const matchedBadges = (userProgress.badges || []).filter(b => c.tags?.includes(b))
          const skillMatch = Math.round((matchedBadges.length / (c.tags?.length || 1)) * 100)

          // Trending score (AI-powered example)
          const trendingScore = Math.round(Math.random() * 100)

          return {
            ...c,
            badges: c.tags?.slice(0, 3) || [],
            progress,
            skillMatch,
            trendingScore,
          }
        })

        // Sort by trendingScore descending
        enriched.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))

        setRecommendations(enriched)
      } catch (err) {
        console.error('Failed to fetch recommendations', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [session?.user?.id])

  const filtered = recommendations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-sky-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Recommended Courses</h1>
            <p className="mt-2 text-gray-700">AI-powered recommendations tailored to your skills and interests.</p>
          </div>
        </header>

        {/* Search */}
        <section className="mb-6">
          <input
            type="text"
            placeholder="Search recommendations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 w-full rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500"
          />
        </section>

        {/* Recommendations Grid */}
        {loading ? (
          <div className="text-center text-gray-600">Loading recommendations...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-600">No recommendations found.</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="relative rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg p-5 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Thumbnail */}
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-36 object-cover rounded-lg mb-4"
                  />
                )}

                {/* Title & Description */}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{course.title}</h2>
                <p className="text-sm text-gray-700 mb-2">{course.description}</p>

                {/* Badges */}
                {course.badges?.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {course.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-white/25 rounded text-gray-800"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Match + Progress Ring */}
                <div className="flex justify-between items-center mb-4">
                  {course.skillMatch !== undefined && (
                    <div className="text-xs text-gray-600">Skill Match: {course.skillMatch}%</div>
                  )}
                  {course.progress !== undefined && (
                    <div className="relative w-10 h-10">
                      <svg className="rotate-[-90deg]" viewBox="0 0 36 36">
                        <circle
                          className="text-green-200"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="transparent"
                          r="16"
                          cx="18"
                          cy="18"
                        />
                        <circle
                          className="text-green-600 transition-all"
                          strokeWidth="4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="16"
                          cx="18"
                          cy="18"
                          strokeDasharray={`${course.progress}, 100`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-900 font-semibold">
                        {course.progress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Category / Level */}
                <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
                  <span className="px-2 py-1 bg-white/25 rounded">{course.category}</span>
                  <span className="px-2 py-1 bg-white/25 rounded">{course.level}</span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <a
                    href={`/student/dashboard/courses/${course.id}`}
                    className="flex-1 text-center px-3 py-2 rounded bg-emerald-600 text-white hover:opacity-95 text-sm"
                  >
                    View Course
                  </a>
                  <a
                    href={`/student/dashboard/courses/${course.id}#enroll`}
                    className="flex-1 text-center px-3 py-2 rounded border border-gray-300 text-sm hover:bg-white/20"
                  >
                    Enroll Now
                  </a>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
