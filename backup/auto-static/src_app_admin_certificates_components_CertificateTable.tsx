'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import CertificateStatusBadge from './CertificateStatusBadge'
import CertificateActions from './CertificateActions'

interface Certificate {
  id: string
  studentName: string
  courseTitle: string
  issueDate: string
  status: 'PENDING' | 'VERIFIED' | 'REVOKED'
  blockchainTx?: string | null
  blockchainContract?: string | null
  blockchainNetwork?: string | null
}

interface Props {
  filter: 'ALL' | 'PENDING' | 'VERIFIED' | 'REVOKED'
}

export default function CertificateTable({ filter }: Props) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  // 🧠 Fetch certificates
  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/certificates', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch certificates')

      const data = await res.json()
      const filtered =
        filter === 'ALL' ? data : data.filter((c: Certificate) => c.status === filter)
      setCertificates(filtered)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [filter])

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-green-700" />
      </div>
    )
  }

  // 📭 Empty
  if (certificates.length === 0) {
    return (
      <div className="text-center text-gray-500 italic py-10">
        No {filter === 'ALL' ? 'certificates' : filter.toLowerCase()} found.
      </div>
    )
  }

  // 🌐 Helper for Polygonscan link
  const getExplorerLink = (tx: string, network?: string | null) => {
    const base =
      network === 'polygon-amoy'
        ? 'https://amoy.polygonscan.com/tx/'
        : 'https://polygonscan.com/tx/'
    return `${base}${tx}`
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
      <table className="min-w-full">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Issue Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Blockchain</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                {c.studentName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{c.courseTitle}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(c.issueDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <CertificateStatusBadge status={c.status} />
              </td>

              {/* 🪙 Blockchain info column */}
              <td className="px-4 py-3 text-sm">
                {c.status === 'VERIFIED' && c.blockchainTx ? (
                  <a
                    href={getExplorerLink(c.blockchainTx, c.blockchainNetwork)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
                  >
                    <Image
                      src="/images/polygon-logo.svg"
                      alt="Polygon"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="text-xs">View on Blockchain</span>
                  </a>
                ) : (
                  <span className="text-gray-400 italic text-xs">
                    {c.status === 'VERIFIED'
                      ? 'Awaiting blockchain record...'
                      : '—'}
                  </span>
                )}
              </td>

              <td className="px-4 py-3">
                <CertificateActions certificate={c} onActionDone={fetchCertificates} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
