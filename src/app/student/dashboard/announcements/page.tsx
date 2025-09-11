'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { getAnnouncements } from '@/services/api/announcements'


interface Announcement {
  id: string
  title: string
  content: string
  date: string // ISO string
  important?: boolean
  badges?: string[] // optional
}

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  if (!session?.user?.id) redirect('/login')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getAnnouncements()
        const enriched = data.map((a: any) => ({
          ...a,
          important: Math.random() < 0.3, // 30% chance for important badge
          badges: a.important ? ['🔥 Important'] : [],
        }))
        setAnnouncements(enriched)
      } catch (err) {
        console.error('Failed to fetch announcements', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-sky-50 to-emerald-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="backdrop-blur-sm bg-white/30 rounded-xl p-6 text-center shadow-lg border border-white/30">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-2 text-gray-700">
              Stay updated with the latest news, alerts, and course updates.
            </p>
          </div>
        </header>

        {/* Search */}
        <section className="mb-6">
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 w-full rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-shadow hover:shadow-lg"
          />
        </section>

        {/* Announcements Grid */}
        {loading ? (
          <div className="text-center text-gray-600">Loading announcements...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-600">No announcements found.</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="relative rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg p-5 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Badges */}
                {a.badges?.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {a.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-red-500/25 rounded text-red-800 font-semibold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title & Content */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{a.title}</h2>
                <p className="text-sm text-gray-700 mb-4 line-clamp-4">{a.content}</p>

                {/* Date */}
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(a.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <button
                    className="flex-1 text-center px-3 py-2 rounded bg-emerald-600 text-white hover:opacity-95 text-sm transition-colors"
                    onClick={() => alert(a.content)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
