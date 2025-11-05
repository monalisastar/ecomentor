'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import CertificateStatsBar from './components/CertificateStatsBar'
import CertificateTable from './components/CertificateTable'

export default function AdminCertificatesPage() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REVOKED'>('ALL')

  return (
    <main className="p-6 pt-[88px] flex flex-col gap-6">
      {/* 🧭 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Certificate Management</h1>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-green-700" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="ALL">All Certificates</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* 📊 Stats Bar */}
      <CertificateStatsBar />

      {/* 📜 Certificates Table */}
      <CertificateTable filter={filter} />
    </main>
  )
}
