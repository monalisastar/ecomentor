'use client'

import { useEffect, useState } from 'react'
import { Loader2, Clock, GraduationCap, Award, BookOpen } from 'lucide-react'

interface ActivityItem {
  type: 'enrollment' | 'certificate' | 'course'
  message: string
  time: string
}

export default function ActivityFeed() {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/admin/activity', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch activity')
        const data = await res.json()
        setActivity(data.activity || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [])

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Loading recent activity...
      </div>
    )

  if (error)
    return <p className="text-red-600 text-sm">Error: {error}</p>

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Recent Platform Activity
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        {activity.length > 0 ? (
          activity.map((item, idx) => {
            let icon = <Clock className="text-gray-400" size={18} />
            if (item.type === 'enrollment')
              icon = <GraduationCap className="text-green-600" size={18} />
            if (item.type === 'certificate')
              icon = <Award className="text-yellow-500" size={18} />
            if (item.type === 'course')
              icon = <BookOpen className="text-blue-500" size={18} />

            return (
              <div
                key={idx}
                className="flex items-center justify-between text-gray-700 border-b border-gray-100 pb-2"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <p className="text-sm">{item.message}</p>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            )
          })
        ) : (
          <p className="text-gray-500 text-sm">No recent activity yet.</p>
        )}
      </div>
    </section>
  )
}
