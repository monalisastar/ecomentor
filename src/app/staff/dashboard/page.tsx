'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { GraduationCap, Award, Users, TrendingUp } from 'lucide-react'
import UpcomingTasks from './components/UpcomingTasks' // ✅ Added import

export default function StaffDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Ensure staff cookie is set (for middleware)
  useEffect(() => {
    async function ensureStaffRole() {
      try {
        const res = await fetch('/api/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'staff' }),
        })
        if (res.ok) {
          console.log('✅ Staff role cookie enforced.')
        } else {
          console.warn('⚠️ Failed to set staff cookie.')
        }
      } catch (error) {
        console.error('❌ Error setting role cookie:', error)
      }
    }

    // Only set cookie after session is confirmed authenticated
    if (status === 'authenticated') {
      ensureStaffRole()
    }
  }, [status])

  // 🧠 Redirect non-staff users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (
      status === 'authenticated' &&
      !session?.user?.roles?.some((r: string) =>
        ['admin', 'lecturer', 'staff'].includes(r)
      )
    ) {
      router.push('/student/dashboard')
    }
  }, [status, session, router])

  // 📊 Fetch overview and recent activity
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const overview = await api.get('progress/overview')
        setStats(overview.summary || {})

        const enrollments = await api.get('enrollments')
        const activity = enrollments.slice(0, 5).map((e: any) => ({
          message: `${e.user?.name || 'A student'} enrolled in ${
            e.course?.title || 'a course'
          }`,
          time: new Date(e.enrolledAt).toLocaleString(),
        }))
        setRecentActivity(activity)
      } catch (err: any) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') loadData()
  }, [status])

  // 🌀 Loading screen
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        Loading staff dashboard...
      </main>
    )
  }

  // ❌ Error screen
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </main>
    )
  }

  const name = session?.user?.name?.split(' ')[0] || 'Instructor'

  const cards = [
    {
      label: 'Total Students',
      value: stats?.totalUsers || 0,
      icon: <Users className="text-green-600" size={22} />,
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: <GraduationCap className="text-green-600" size={22} />,
    },
    {
      label: 'Certificates Issued',
      value: stats?.completedEnrollments || 0,
      icon: <Award className="text-green-600" size={22} />,
    },
    {
      label: 'Avg Progress',
      value: `${stats?.averageProgress || 0}%`,
      icon: <TrendingUp className="text-green-600" size={22} />,
    },
  ]

  return (
    <main className="space-y-10">
      {/* 🌿 Header */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-green-700">{name}</span> 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here’s an overview of your teaching performance and academy activity.
        </p>
      </section>

      {/* 📊 Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">{item.icon}</div>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">
              {item.value}
            </h3>
          </div>
        ))}
      </section>

      {/* 🧠 Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-gray-700"
              >
                <p>✅ {item.message}</p>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity yet.</p>
          )}
        </div>
      </section>

      {/* 🎯 Upcoming Tasks (Dynamic) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Tasks
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <UpcomingTasks />
        </div>
      </section>
    </main>
  )
}
