'use client'

import { Award, Download, ExternalLink, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export type Certification = {
  id: string
  title: string
  courseSlug: string
  issuedDate: string
  status: 'Verified' | 'In Progress' | 'Revoked'
  thumbnail: string
  blockchainTx?: string | null
  blockchainContract?: string | null
  blockchainNetwork?: string | null
}

export default function CertificationCard({ cert }: { cert: Certification }) {
  const isVerified = cert.status === 'Verified'
  const isRevoked = cert.status === 'Revoked'

  // 🌐 Polygonscan link generator
  const getExplorerLink = (tx: string, network?: string | null) => {
    const base =
      network === 'polygon-amoy'
        ? 'https://amoy.polygonscan.com/tx/'
        : 'https://polygonscan.com/tx/'
    return `${base}${tx}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-3 flex flex-col">
      {/* Thumbnail */}
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={cert.thumbnail}
          alt={cert.title}
          className="w-full h-40 object-cover"
        />
        <div
          className={`absolute top-2 right-2 text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
            isVerified
              ? 'bg-green-100 text-green-700'
              : isRevoked
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          <Award size={12} /> {cert.status}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between mt-3 space-y-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
            {cert.title}
          </h3>
          <p className="text-sm text-gray-600">
            Issued on {cert.issuedDate}
          </p>

          {/* 🪙 Blockchain Info */}
          {isVerified && cert.blockchainTx && (
            <div className="mt-2 flex items-center gap-2">
              <Image
                src="/images/polygon-logo.svg"
                alt="Polygon"
                width={16}
                height={16}
                className="opacity-90"
              />
              <a
                href={getExplorerLink(cert.blockchainTx, cert.blockchainNetwork)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
              >
                <CheckCircle2 size={12} className="text-green-600" />
                <span>Verified on Blockchain</span>
              </a>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-3">
          {isVerified ? (
            <>
              {/* 🟩 View Verified Certificate */}
              <button
                onClick={() =>
                  window.open(`/api/certificates/pdf/${cert.courseSlug}`, '_blank')
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
              >
                <ExternalLink size={14} />
                View
              </button>

              {/* 🟩 Download Verified Certificate */}
              <a
                href={`/api/certificates/pdf/${cert.courseSlug}`}
                download={`${cert.title.replace(/\s+/g, '-')}-certificate.pdf`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-green-700 border border-green-600 hover:bg-green-50 transition"
              >
                <Download size={14} />
                Download
              </a>
            </>
          ) : (
            <Link
              href={`/student/courses/${cert.courseSlug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition"
            >
              Continue Course
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
