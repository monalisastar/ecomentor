'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Clock, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

interface InsightsData {
  totalHours?: number
  avgQuizScore?: number
  totalCertificates?: number
  weeklyData?: { day: string; hours: number }[]
}

export default function LearningInsights() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await api.get('progress/insights')
        setData(res)
      } catch (err) {
        console.error('Failed to load insights:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  const skeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
        ))}
    </div>
  )

  if (loading) return skeleton

  return (
    <motion.section
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        Your Learning Insights
      </h2>

      {/* 📊 Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InsightCard
          icon={<Clock className="w-6 h-6" />}
          label="Total Hours Learned"
          value={`${data?.totalHours ?? 0} hrs`}
          color="green"
        />
        <InsightCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Average Quiz Score"
          value={`${data?.avgQuizScore ?? 0}%`}
          color="blue"
        />
        <InsightCard
          icon={<Award className="w-6 h-6" />}
          label="Certificates Earned"
          value={String(data?.totalCertificates ?? 0)}
          color="yellow"
        />
      </div>

      {/* 📈 Weekly bar chart */}
      {data?.weeklyData && data.weeklyData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm text-gray-600 mb-3 font-medium">
            Weekly Learning Time (hrs)
          </h3>
          <div className="flex items-end gap-3 h-36 sm:h-40 md:h-48">
            {data.weeklyData.map((day, i) => (
              <motion.div
                key={i}
                className="flex-1 flex flex-col items-center text-center"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <motion.div
                  className="relative w-3/4 rounded-t-md bg-green-500 hover:bg-green-600"
                  style={{ height: `${(day.hours / 5) * 100}%` }}
                  whileHover={{ scaleY: 1.05 }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 hover:opacity-100 transition">
                    {day.hours}h
                  </span>
                </motion.div>
                <p className="text-xs mt-1 text-gray-500">{day.day}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  )
}

/** 🧩 Reusable metric card */
function InsightCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'green' | 'blue' | 'yellow'
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition hover:shadow-sm ${colorMap[color]}`}
    >
      <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}
