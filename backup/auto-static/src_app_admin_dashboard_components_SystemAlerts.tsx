'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Users, Award, BookOpen, CreditCard } from 'lucide-react'

interface AlertItem {
  type: 'certificate' | 'payment' | 'course' | 'staff'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/admin/alerts', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch alerts')
        const data = await res.json()
        setAlerts(data.alerts || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Checking system alerts...
      </div>
    )

  if (error)
    return <p className="text-red-600 text-sm">Error: {error}</p>

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">System Alerts</h2>

      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 text-gray-500 flex items-center gap-2">
          <CheckCircle2 className="text-green-600" size={20} />
          All systems operational.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            let icon = <AlertTriangle className="text-gray-500" size={18} />
            if (alert.type === 'certificate') icon = <Award className="text-yellow-500" size={18} />
            if (alert.type === 'payment') icon = <CreditCard className="text-red-500" size={18} />
            if (alert.type === 'course') icon = <BookOpen className="text-green-600" size={18} />
            if (alert.type === 'staff') icon = <Users className="text-blue-600" size={18} />

            const bg =
              alert.severity === 'high'
                ? 'bg-red-50 border-red-300'
                : alert.severity === 'medium'
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-green-50 border-green-200'

            return (
              <div
                key={idx}
                className={`border rounded-lg p-4 flex items-center justify-between ${bg}`}
              >
                <div className="flex items-center gap-3 text-sm text-gray-800">
                  {icon}
                  <span>{alert.message}</span>
                </div>
                {alert.severity === 'high' && (
                  <XCircle className="text-red-600" size={18} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
