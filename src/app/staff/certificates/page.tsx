'use client'

import { useEffect, useState } from 'react'
import { PlusCircle, Search, Loader2, Paintbrush } from 'lucide-react'
import CertificateCard, { Certificate } from './components/CertificateCard'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CertificatesPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  // 🧠 Fetch all certificates from backend
  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/certificates', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch certificates')
      const data = await res.json()
      setCertificates(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  // 🔍 Filter by search (student or course)
  const filtered = certificates.filter(
    (c) =>
      c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
        <Loader2 className="animate-spin mb-2" size={22} />
        Loading certificates...
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6 mt-4">
      {/* 🧭 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Certificate Management 🏅
        </h1>

        <div className="flex items-center gap-3">
          {/* 🔍 Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm w-64"
            />
          </div>

          {/* 🖌️ Link to Certificate Builder */}
          <Link
            href="/staff/certificates/design"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
          >
            <Paintbrush size={18} /> Design Layout
          </Link>

          {/* ➕ Placeholder for 'Issue New' modal */}
          <button
            onClick={() => toast.info('Manual certificate issuance flow coming soon 🧩')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <PlusCircle size={18} /> Issue New
          </button>
        </div>
      </div>

      {/* 🧾 Certificate Grid */}
      <section>
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
            {filtered.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} onRefresh={fetchCertificates} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-10 text-center">
            No certificates found.
          </p>
        )}
      </section>
    </div>
  )
}
