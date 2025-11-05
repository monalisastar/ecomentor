'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

interface TrendData {
  month: string
  enrollments: number
  revenue: number
}

export default function ChartSection() {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load analytics')
        const { trend } = await res.json()
        setData(trend || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Loading analytics...
      </div>
    )

  if (error)
    return <p className="text-red-600 text-sm">Error: {error}</p>

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      {/* 📈 Enrollments Trend */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Monthly Enrollments
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="enrollments"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Enrollments"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 💰 Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Revenue Growth
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#f4b940" name="Revenue (USD)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
