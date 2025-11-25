'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Download, ExternalLink, X } from 'lucide-react'

export interface Certification {
  id: string
  title: string
  courseSlug: string
  issuedDate: string
  status: string
  certificateUrl?: string
  verificationUrl?: string
  blockchainTx?: string | null
  blockchainContract?: string | null
  blockchainNetwork?: string | null
  verifiedBy?: string
  issuedBy?: string
  metadataUrl?: string | null // ✅ Added for Pinata metadata
  course?: {
    title?: string
    image?: string
    slug?: string
  }
}

export default function CertificationCard({ cert }: { cert: Certification }) {
  const [certData, setCertData] = useState<Certification>(cert)
  const [loading, setLoading] = useState(true)
  const [showMetadata, setShowMetadata] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)

  // 🔁 Fetch full certificate details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/certificates/${cert.id}`)
        if (res.ok) {
          const data = await res.json()
          setCertData(data)
        }
      } catch (err) {
        console.error('⚠️ Failed to fetch certificate details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [cert.id])

  const status = certData.status?.trim().toLowerCase() || 'unknown'

  const isVerified = status === 'verified'
  const isPending = status === 'in progress' || status === 'pending'
  const isRevoked =
    status === 'revoked' || status === 'expired' || status === 'revoked certificate'

  // 🎨 Dynamic colors
  const borderColor = isVerified
    ? 'border-green-300'
    : isPending
    ? 'border-yellow-300'
    : 'border-red-300'

  const bgColor = isVerified
    ? 'bg-green-50'
    : isPending
    ? 'bg-yellow-50'
    : 'bg-red-50'

  const textColor = isVerified
    ? 'text-green-600'
    : isPending
    ? 'text-yellow-600'
    : 'text-red-600'

  // 🧾 Fetch Pinata metadata when clicked
  const handleViewMetadata = async () => {
    if (!certData.metadataUrl) return
    try {
      setMetadataLoading(true)
      const res = await fetch(certData.metadataUrl)
      const data = await res.json()
      setMetadata(data)
      setShowMetadata(true)
    } catch (error) {
      console.error('❌ Failed to load blockchain metadata:', error)
    } finally {
      setMetadataLoading(false)
    }
  }

  // 🧱 Supabase public bucket path
  const supabaseBase =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    '/storage/v1/object/public/eco-mentor-assets/'

  // 🖼️ Course image or fallback
  const imageUrl = (() => {
    if (certData.course?.image?.startsWith('http')) return certData.course.image
    if (certData.course?.image) return supabaseBase + certData.course.image
    return '/images/certificate-yellow.png'
  })()

  // 📄 PDF download
  const handleDownload = () => {
    if (!certData.id) return
    const pdfUrl = `/api/certificates/${certData.id}/pdf`
    window.open(pdfUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50 animate-pulse">
        <p className="text-gray-400 text-sm">Loading certificate...</p>
      </div>
    )
  }

  return (
    <>
      <div
        className={`relative border ${borderColor} ${bgColor} rounded-xl p-4 shadow-sm hover:shadow-md transition`}
      >
        {/* 🪙 Polygon Verified Badge */}
        {isVerified && certData.blockchainTx && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-full flex items-center gap-1 px-2 py-1 shadow-sm z-10">
            <Image
              src="/images/polygon-logo.svg"
              alt="Polygon"
              width={12}
              height={12}
            />
            <span className="text-[10px] font-medium text-purple-700">
              Immutable Record
            </span>
          </div>
        )}

        {/* 🖼️ Thumbnail */}
        <div className="relative w-full h-40 mb-3">
          <Image
            src={imageUrl}
            alt={certData.course?.title || certData.title || 'Certificate'}
            fill
            unoptimized
            className="object-cover rounded-lg"
          />
        </div>

        {/* 🏫 Title */}
        <h3 className="font-semibold text-lg text-gray-800 mb-1">
          {certData.course?.title || certData.title || 'Untitled Course'}
        </h3>

        {/* 📅 Issue Date */}
        <p className="text-sm text-gray-500 mb-2">
          Issued: {certData.issuedDate || '—'}
        </p>

        {/* 🔖 Status */}
        <p className={`text-sm font-semibold ${textColor}`}>
          {isVerified
            ? 'Verified on Blockchain'
            : isPending
            ? 'In Progress'
            : isRevoked
            ? 'Revoked'
            : 'Unknown'}
        </p>

        {/* 📜 Info */}
        <p className="text-xs text-gray-500 mt-2">
          {isVerified
            ? 'Certificate recorded on the Polygon network.'
            : isPending
            ? 'Verification in progress.'
            : 'Certificate not available yet.'}
        </p>

        {/* 🎯 Actions */}
        {isVerified && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 text-sm py-2 rounded-lg hover:bg-green-100 transition"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            {certData.metadataUrl && (
              <button
                onClick={handleViewMetadata}
                disabled={metadataLoading}
                className="flex items-center justify-center gap-2 text-sm text-purple-700 hover:text-purple-900 transition"
              >
                <ExternalLink className="w-4 h-4" />
                {metadataLoading ? 'Loading...' : 'View Blockchain Record'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🧩 Metadata Modal */}
      {showMetadata && metadata && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              onClick={() => setShowMetadata(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-purple-700">
              Blockchain Metadata Record
            </h2>

            <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
              <p>
                <strong>Name:</strong> {metadata.name}
              </p>
              <p>
                <strong>Description:</strong> {metadata.description}
              </p>
              <p>
                <strong>Issuer:</strong>{' '}
                {metadata.attributes?.find(
                  (a: any) => a.trait_type === 'Issuer'
                )?.value || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {metadata.attributes?.find(
                  (a: any) => a.trait_type === 'Status'
                )?.value || 'N/A'}
              </p>
              <p>
                <strong>Blockchain:</strong>{' '}
                {metadata.attributes?.find(
                  (a: any) => a.trait_type === 'Blockchain'
                )?.value || 'N/A'}
              </p>
              {metadata.files?.[0]?.url && (
                <a
                  href={metadata.files[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline mt-3 block"
                >
                  🔗 View Certificate PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
