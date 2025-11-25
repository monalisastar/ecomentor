'use client'

import { useEffect, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
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
  const [refreshing, setRefreshing] = useState(false)

  // 🧠 Fetch certificates (always fresh)
  const fetchCertificates = async () => {
    try {
      if (!refreshing) setLoading(true)
      const res = await fetch(`/api/admin/certificates?t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Failed to fetch certificates')
      const data = await res.json()

      const filtered =
        filter === 'ALL' ? data : data.filter((c: Certificate) => c.status === filter)
      setCertificates(filtered)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [filter])

  // 🌐 Get Polygonscan link
  const getExplorerLink = (tx: string, network?: string | null) => {
    const base =
      network === 'polygon-amoy'
        ? 'https://amoy.polygonscan.com/tx/'
        : 'https://polygonscan.com/tx/'
    return `${base}${tx}`
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-green-700" />
      </div>
    )
  }

  // 📭 Empty view
  if (certificates.length === 0) {
    return (
      <div className="text-center text-gray-500 italic py-10">
        No {filter === 'ALL' ? 'certificates' : filter.toLowerCase()} found.
      </div>
    )
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

              {/* 🪙 Blockchain Info */}
              <td className="px-4 py-3 text-sm">
                {c.status === 'VERIFIED' && c.blockchainTx ? (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-2 py-1 rounded-md border border-green-300 text-xs font-medium">
                    {/* ✅ Directly using your local Polygon logo */}
                    <Image
                      src="/images/polygon-logo.svg"
                      alt="Polygon Blockchain"
                      width={16}
                      height={16}
                      className="rounded-sm"
                      priority
                    />
                    <a
                      href={getExplorerLink(c.blockchainTx, c.blockchainNetwork)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-900 flex items-center gap-1"
                    >
                      Minted <ExternalLink size={11} />
                    </a>
                  </div>
                ) : c.status === 'VERIFIED' ? (
                  <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md border border-yellow-300 text-xs font-medium animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Awaiting on-chain record
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-xs">—</span>
                )}
              </td>

              {/* ⚙️ Actions */}
              <td className="px-4 py-3">
                <CertificateActions
                  certificate={c}
                  onActionDone={() => {
                    setRefreshing(true)
                    fetchCertificates()
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
