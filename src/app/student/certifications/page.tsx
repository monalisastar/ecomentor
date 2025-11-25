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

  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true)
        const res = await fetch('/api/certificates', { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to fetch certificates')
          toast.error('Failed to load certificates.')
          return
        }

        // ✅ FIXED Normalization Logic
        const normalized = data.map((cert: any) => {
          const rawStatus = cert.status?.toString().trim().toLowerCase()

          let statusLabel = 'Revoked'
          if (rawStatus === 'verified') statusLabel = 'Verified'
          else if (rawStatus === 'pending' || rawStatus === 'in progress')
            statusLabel = 'In Progress'

          return {
            id: cert.id,
            title: cert.courseTitle || 'Untitled Course',
            status: statusLabel,
            issueDate: cert.issueDate,
            courseSlug: cert.courseSlug,
            verificationUrl: cert.verificationUrl,
          }
        })

        setCertifications(normalized)
      } catch (err) {
        console.error('❌ Error fetching certificates:', err)
        toast.error('Error fetching certificates.')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const filtered = certifications.filter((cert) => {
    const matchesQuery = cert.title.toLowerCase().includes(query.toLowerCase())
    const matchesStatus =
      statusFilter === 'All' || cert.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <section className="space-y-8">
      <CertificationHeader count={certifications.length} />
      <CertificationFilterBar
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-6 w-6 text-emerald-600" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <CertificationGrid
          certifications={filtered}
          query={query}
          statusFilter={statusFilter}
        />
      )}
    </section>
  )
}
