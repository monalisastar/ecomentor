'use client'

import { useState } from 'react'
import { PlusCircle, Search } from 'lucide-react'
import CertificateCard, { Certificate } from './components/CertificateCard'
import CertificateModal from './components/CertificateModal'

export default function CertificatesPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  // 🧩 Mock data (replace with DB or API fetch)
  const certificates: Certificate[] = [
    {
      id: 'cert-001',
      courseTitle: 'Introduction to Climate Change & Emissions',
      studentName: 'Brian Njau Njata',
      issueDate: '2025-02-15',
      status: 'Verified',
      certificateUrl: '/api/certificates/climate-intro',
    },
    {
      id: 'cert-002',
      courseTitle: 'GHG Accounting Fundamentals',
      studentName: 'Jane Mwangi',
      issueDate: '2025-03-01',
      status: 'Pending',
      certificateUrl: '/api/certificates/ghg-accounting',
    },
    {
      id: 'cert-003',
      courseTitle: 'Carbon Developer Essentials',
      studentName: 'Alex Otieno',
      issueDate: '2025-02-22',
      status: 'Revoked',
      certificateUrl: '/api/certificates/carbon-developer',
    },
  ]

  // 🔍 Filter certificates by search
  const filteredCerts = certificates.filter(
    (c) =>
      c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase())
  )

  const handleIssueNew = () => {
    setSelectedCert(null)
    setModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Certificates Management 🏅</h1>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleIssueNew}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <PlusCircle size={18} /> Issue New
          </button>
        </div>
      </div>

      {/* Certificate Grid */}
      <section>
        {filteredCerts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {filteredCerts.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-10 text-center">
            No certificates found.
          </p>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <CertificateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          studentName="Select Student"
          courseTitle="Select Course"
        />
      )}
    </main>
  )
}
