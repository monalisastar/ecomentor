'use client'

import { useEffect, useState } from 'react'
import { Loader2, Users, BookOpen, GraduationCap, Award, TrendingUp } from 'lucide-react'
import StatCard from './StatCard'

interface Overview {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalCertificates: number
  totalRevenue: number
}

export default function StatsGrid() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/overview', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch overview data')
        const { summary } = await res.json()
        setData(summary)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Loading statistics...
      </div>
    )

  if (error)
    return <p className="text-red-600 text-sm">Error: {error}</p>

  if (!data)
    return <p className="text-gray-500 text-sm">No data available.</p>

  const cards = [
    { label: 'Total Users', value: data.totalUsers, icon: Users },
    { label: 'Total Courses', value: data.totalCourses, icon: BookOpen },
    { label: 'Total Enrollments', value: data.totalEnrollments, icon: GraduationCap },
    { label: 'Certificates Issued', value: data.totalCertificates, icon: Award },
    {
      label: 'Total Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
    },
  ]

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  )
}
