'use client'

import { useState } from 'react'
import {
  Award,
  Eye,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export type Certificate = {
  id: string
  courseTitle: string
  studentName: string
  issueDate: string
  status: 'VERIFIED' | 'REVOKED' | 'PENDING'
  certificateUrl: string
  courseSlug?: string
  blockchainTx?: string | null
  blockchainContract?: string | null
  blockchainNetwork?: string | null
  studentWallet?: string | null
}

export default function CertificateCard({
  cert,
  onRefresh,
}: {
  cert: Certificate
  onRefresh?: () => void
}) {
  const [loadingAction, setLoadingAction] = useState<
    'verify' | 'revoke' | 'regen' | 'mint' | null
  >(null)

  const statusColor =
    cert.status === 'VERIFIED'
      ? 'bg-green-100 text-green-700'
      : cert.status === 'REVOKED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700'

  // 🌐 Helper for Polygonscan link
  const getExplorerLink = (tx: string, network?: string | null) => {
    const base =
      network === 'polygon-amoy'
        ? 'https://amoy.polygonscan.com/tx/'
        : 'https://polygonscan.com/tx/'
    return `${base}${tx}`
  }

  // ✅ Verify + Mint
  const verifyAndMint = async () => {
    if (!confirm('Verify and mint this certificate on Polygon?')) return
    setLoadingAction('verify')

    try {
      // Step 1: Verify certificate in DB
      const res = await fetch(`/api/certificates/verify/${cert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFIED' }),
      })
      if (!res.ok) throw new Error('Failed to verify certificate')

      // Step 2: Mint certificate NFT on Polygon
      setLoadingAction('mint')
      const mintRes = await fetch(`/api/certificates/mint/${cert.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: cert.studentWallet,
          metadataURI: cert.certificateUrl,
        }),
      })

      if (!mintRes.ok) {
        const err = await mintRes.json()
        throw new Error(err.error || 'Minting failed')
      }

      const mintData = await mintRes.json()
      toast.success(`✅ Minted on Polygon! Tx: ${mintData.txHash}`)
      onRefresh?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  // ❌ Revoke
  const revokeCertificate = async () => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return
    setLoadingAction('revoke')
    try {
      const res = await fetch(`/api/certificates/verify/${cert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVOKED' }),
      })
      if (!res.ok) throw new Error('Failed to revoke certificate')
      toast.success('Certificate revoked successfully.')
      onRefresh?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  // ♻️ Regenerate PDF
  const regenerateCertificate = async () => {
    if (!cert.courseSlug) {
      toast.error('Course slug missing — cannot regenerate.')
      return
    }

    if (!confirm('Re-generate this certificate with latest layout?')) return

    setLoadingAction('regen')
    try {
      const res = await fetch(`/api/certificates/${cert.courseSlug}`)
      if (!res.ok) throw new Error('Failed to regenerate certificate')
      toast.success('Certificate PDF re-generated successfully 🎉')
      onRefresh?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-green-700" />
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {cert.courseTitle}
          </h3>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}
        >
          {cert.status}
        </span>
      </div>

      {/* Student Info */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Student:</span> {cert.studentName}
        </p>
        <p className="text-gray-500 text-xs">Issued on {cert.issueDate}</p>
      </div>

      {/* Blockchain Link */}
      {cert.blockchainTx && cert.status === 'VERIFIED' && (
        <a
          href={getExplorerLink(cert.blockchainTx, cert.blockchainNetwork)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-xs text-green-700 font-medium hover:text-green-900"
        >
          <Image
            src="/images/polygon-logo.svg"
            alt="Polygon"
            width={14}
            height={14}
          />
          View on Blockchain
          <ExternalLink size={12} />
        </a>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* 🔍 View PDF */}
        <a
          href={cert.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-green-700 border border-green-600 rounded-md py-2 hover:bg-green-50 transition"
        >
          <Eye size={14} /> View
        </a>

        {/* ♻️ Regenerate */}
        <button
          disabled={loadingAction === 'regen'}
          onClick={regenerateCertificate}
          className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-purple-700 border border-purple-600 rounded-md py-2 hover:bg-purple-50 transition disabled:opacity-50"
        >
          {loadingAction === 'regen' ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              <RefreshCcw size={14} /> Re-Generate
            </>
          )}
        </button>

        {/* ✅ Verify & Mint */}
        <button
          disabled={loadingAction === 'verify' || loadingAction === 'mint'}
          onClick={verifyAndMint}
          className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-blue-700 border border-blue-600 rounded-md py-2 hover:bg-blue-50 transition disabled:opacity-50"
        >
          {loadingAction === 'verify' || loadingAction === 'mint' ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              <ShieldCheck size={14} /> Verify & Mint
            </>
          )}
        </button>

        {/* ❌ Revoke */}
        <button
          disabled={loadingAction === 'revoke'}
          onClick={revokeCertificate}
          className="flex items-center justify-center gap-1 text-sm font-medium text-red-700 border border-red-600 rounded-md py-2 px-3 hover:bg-red-50 transition disabled:opacity-50"
        >
          {loadingAction === 'revoke' ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              <Trash2 size={14} /> Revoke
            </>
          )}
        </button>
      </div>
    </div>
  )
}
