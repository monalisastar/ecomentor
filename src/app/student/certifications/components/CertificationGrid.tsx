'use client'

import CertificationCard, { Certification } from './CertificationCard'

type Props = {
  certifications: Certification[]
  query: string
  statusFilter: string
}

export default function CertificationGrid({
  certifications,
  query,
  statusFilter,
}: Props) {
  // 🔍 Filter logic
  const filtered = certifications.filter((cert) => {
    const matchesQuery = cert.title
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesStatus =
      statusFilter === 'All' || cert.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="mt-8">
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cert) => (
            <CertificationCard key={cert.id} cert={cert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-gray-600 text-lg font-medium">
            No certifications found.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  )
}
