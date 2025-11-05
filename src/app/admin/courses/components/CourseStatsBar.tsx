'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CourseStats {
  adminStatus: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
  _count: number
}

export default function CourseStatsBar() {
  const [stats, setStats] = useState<CourseStats[]>([])
  const [loading, setLoading] = useState(true)

  // 🧠 Fetch aggregated stats
  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/courses/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load course stats')
      const data = await res.json()
      setStats(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // 🧮 Compute counts safely
  const getCount = (status: string) =>
    stats.find((s) => s.adminStatus === status)?._count || 0

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-green-700" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* ✅ Approved */}
      <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-green-800">Approved</h3>
        <p className="text-3xl font-bold text-green-700 mt-1">{getCount('APPROVED')}</p>
      </div>

      {/* 🟡 Under Review */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-yellow-800">Under Review</h3>
        <p className="text-3xl font-bold text-yellow-700 mt-1">{getCount('UNDER_REVIEW')}</p>
      </div>

      {/* 🔴 Revoked */}
      <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-red-800">Revoked</h3>
        <p className="text-3xl font-bold text-red-700 mt-1">{getCount('REVOKED')}</p>
      </div>
    </div>
  )
}
