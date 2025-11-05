// ✅ src/app/admin/certificates/components/CertificateStatsBar.tsx
'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function CertificateStatsBar() {
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, revoked: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/certificates', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch certificates')
        const data = await res.json()
        const verified = data.filter((c: any) => c.status === 'VERIFIED').length
        const revoked = data.filter((c: any) => c.status === 'REVOKED').length
        const pending = data.filter((c: any) => c.status === 'PENDING').length
        setStats({ total: data.length, verified, pending, revoked })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-green-700" />
      </div>
    )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-700' },
        { label: 'Verified', value: stats.verified, color: 'bg-green-100 text-green-700' },
        { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-700' },
        { label: 'Revoked', value: stats.revoked, color: 'bg-red-100 text-red-700' },
      ].map((s) => (
        <div
          key={s.label}
          className={`rounded-lg p-4 flex flex-col items-center ${s.color} font-semibold`}
        >
          <span className="text-lg">{s.value}</span>
          <span className="text-sm">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
