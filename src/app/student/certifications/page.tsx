'use client'

import { useState } from 'react'
import CertificationHeader from './components/CertificationHeader'
import CertificationFilterBar from './components/CertificationFilterBar'
import CertificationGrid from './components/CertificationGrid'
import { Certification } from './components/CertificationCard'

// 📦 Temporary mock data (replace with DB data later)
const mockCertifications: Certification[] = [
  {
    id: 1,
    title: 'Introduction to Climate Change & Emissions',
    courseSlug: 'climate-intro',
    issuedDate: 'June 15, 2025',
    status: 'Verified',
    thumbnail: '/images/certificate-green.png',
    certificateUrl: '/certificates/climate-intro.pdf',
  },
  {
    id: 2,
    title: 'Carbon Developer Essentials',
    courseSlug: 'carbon-developer',
    issuedDate: 'July 8, 2025',
    status: 'In Progress',
    thumbnail: '/images/certificate-yellow.png',
  },
  {
    id: 3,
    title: 'Diploma in GHG Accounting',
    courseSlug: 'ghg-accounting',
    issuedDate: 'August 22, 2025',
    status: 'Expired',
    thumbnail: '/images/certificate-red.png',
    certificateUrl: '/certificates/ghg-accounting.pdf',
  },
]

export default function CertificationsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

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
          certifications={mockCertifications}
          query={query}
          statusFilter={statusFilter}
        />
      </div>
    </main>
  )
}
