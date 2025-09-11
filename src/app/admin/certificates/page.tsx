'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Certificate = {
  id: number
  student: string
  course: string
  type: 'PDF' | 'Blockchain'
  status: 'Issued' | 'Revoked'
  issuedAt: string
  nftHash?: string
}

const mockCertificates: Certificate[] = [
  { id: 1, student: 'Alice', course: 'Intro to Climate', type: 'PDF', status: 'Issued', issuedAt: '2025-09-05' },
  { id: 2, student: 'Bob', course: 'Carbon Accounting', type: 'Blockchain', status: 'Issued', issuedAt: '2025-09-04', nftHash: '0xabc123def4567890' },
  { id: 3, student: 'Charlie', course: 'Renewable Energy', type: 'PDF', status: 'Revoked', issuedAt: '2025-09-03' },
]

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState(mockCertificates)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newCert, setNewCert] = useState<Certificate>({
    id: Date.now(),
    student: '',
    course: '',
    type: 'PDF',
    status: 'Issued',
    issuedAt: new Date().toISOString().slice(0, 10),
    nftHash: undefined,
  })

  const filteredCertificates = certificates.filter(
    c =>
      c.student.toLowerCase().includes(search.toLowerCase()) ||
      c.course.toLowerCase().includes(search.toLowerCase())
  )

  const generateMockNFTHash = () => {
    // generate a random 16-character hex string
    const chars = 'abcdef0123456789'
    let hash = '0x'
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const handleIssue = () => {
    const certificateToAdd = { ...newCert }
    if (certificateToAdd.type === 'Blockchain') {
      certificateToAdd.nftHash = generateMockNFTHash()
    }
    setCertificates(prev => [...prev, { ...certificateToAdd, id: Date.now() }])
    setNewCert({
      id: Date.now(),
      student: '',
      course: '',
      type: 'PDF',
      status: 'Issued',
      issuedAt: new Date().toISOString().slice(0, 10),
      nftHash: undefined,
    })
    setCreating(false)
  }

  const handleRevoke = (id: number) => {
    setCertificates(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'Revoked' } : c))
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎓 Manage Certificates</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          ➕ Issue Certificate
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by student or course..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white mb-6"
      />

      {/* Certificates Table */}
      <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <table className="w-full text-left text-white">
          <thead className="border-b border-white/20">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Student</th>
              <th className="p-3">Course</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Issued At</th>
              <th className="p-3">NFT Hash</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.map(cert => (
              <tr key={cert.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-2">{cert.id}</td>
                <td className="p-2">{cert.student}</td>
                <td className="p-2">{cert.course}</td>
                <td className="p-2">{cert.type}</td>
                <td className="p-2">{cert.status}</td>
                <td className="p-2">{cert.issuedAt}</td>
                <td className="p-2 font-mono text-sm">{cert.nftHash ?? '-'}</td>
                <td className="p-2 flex gap-2">
                  {cert.status === 'Issued' && (
                    <button
                      onClick={() => handleRevoke(cert.id)}
                      className="px-2 py-1 bg-red-600 rounded-lg text-sm hover:bg-red-700"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Certificate Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">➕ Issue Certificate</h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleIssue()
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newCert.student}
                  onChange={e => setNewCert({ ...newCert, student: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={newCert.course}
                  onChange={e => setNewCert({ ...newCert, course: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                <select
                  value={newCert.type}
                  onChange={e => setNewCert({ ...newCert, type: e.target.value as 'PDF' | 'Blockchain' })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="Blockchain">Blockchain/NFT</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    Issue
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
