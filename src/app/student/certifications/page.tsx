'use client'

import { useEffect, useState } from 'react'
import CertificationHeader from './components/CertificationHeader'
import CertificationFilterBar from './components/CertificationFilterBar'
import CertificationGrid from './components/CertificationGrid'
import { Certification } from './components/CertificationCard'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 🧠 Fetch student certificates from backend
  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true)
        const res = await fetch('/api/certificates')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to fetch certificates')
          toast.error('Failed to load certificates.')
          return
        }

        // 🧩 Normalize response for UI
        const normalized: Certification[] = data.map((cert: any) => ({
          id: cert.id,
          title: cert.courseTitle,
          courseSlug: cert.courseSlug,
          issuedDate: cert.issueDate
            ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Pending Issue',
          status:
            cert.status === 'VERIFIED'
              ? 'Verified'
              : cert.status === 'PENDING'
              ? 'In Progress'
              : 'Revoked',
          thumbnail:
            cert.status === 'VERIFIED'
              ? '/images/certificate-green.png'
              : cert.status === 'PENDING'
              ? '/images/certificate-yellow.png'
              : '/images/certificate-red.png',
          certificateUrl: cert.certificateUrl || '',
        }))

        setCertifications(normalized)
      } catch (err: any) {
        console.error('Error fetching certificates:', err)
        setError(err.message)
        toast.error('Network error fetching certificates.')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  // 💬 Error UI
  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl px-6 py-5 shadow-sm">
          <p className="font-semibold mb-1">Error loading certificates</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </main>
    )

  // 🌱 Main Dashboard
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* 🏅 Header */}
        <CertificationHeader />

        {/* 🔍 Filter Bar */}
        <CertificationFilterBar
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* 🧾 Grid */}
        <CertificationGrid
          certifications={certifications}
          query={query}
          statusFilter={statusFilter}
        />
      </div>

      {/* ⏳ Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 size={36} className="animate-spin text-green-600" />
        </div>
      )}
    </main>
  )
}
