'use client'

import CertificationCard, { Certification } from './CertificationCard'
import Image from 'next/image'

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
  // 🔍 Filter & Sort
  const filtered = certifications
    .filter((cert) => {
      const matchesQuery = cert.title
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesStatus =
        statusFilter === 'All' || cert.status === statusFilter
      return matchesQuery && matchesStatus
    })
    .sort((a, b) => {
      const aVerified = a.status === 'Verified' && a.blockchainTx
      const bVerified = b.status === 'Verified' && b.blockchainTx
      if (aVerified && !bVerified) return -1
      if (!aVerified && bVerified) return 1
      return 0
    })

  return (
    <div className="mt-8">
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className={`relative transition-transform hover:scale-[1.02] ${
                cert.status === 'Verified' && cert.blockchainTx
                  ? 'ring-2 ring-purple-400/60 shadow-md shadow-purple-100 rounded-xl'
                  : ''
              }`}
            >
              {/* 🪙 Polygon Verified Badge */}
              {cert.status === 'Verified' && cert.blockchainTx && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-full flex items-center gap-1 px-2 py-1 shadow-sm z-10">
                  <Image
                    src="/images/polygon-logo.svg"
                    alt="Polygon"
                    width={12}
                    height={12}
                  />
                  <span className="text-[10px] font-medium text-purple-700">
                    Verified
                  </span>
                </div>
              )}

              <CertificationCard cert={cert} />
            </div>
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
