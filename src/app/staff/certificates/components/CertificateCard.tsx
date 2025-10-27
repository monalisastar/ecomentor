'use client'

import { Award, Eye, ShieldCheck, Trash2 } from 'lucide-react'
import Link from 'next/link'

export type Certificate = {
  id: string
  courseTitle: string
  studentName: string
  issueDate: string
  status: 'Verified' | 'Revoked' | 'Pending'
  certificateUrl: string
}

export default function CertificateCard({ cert }: { cert: Certificate }) {
  const statusColor =
    cert.status === 'Verified'
      ? 'bg-green-100 text-green-700'
      : cert.status === 'Revoked'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700'

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

        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
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

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <a
          href={cert.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-green-700 border border-green-600 rounded-md py-2 hover:bg-green-50 transition"
        >
          <Eye size={14} /> View
        </a>

        <Link
          href={`/verify/${cert.id}`}
          className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-blue-700 border border-blue-600 rounded-md py-2 hover:bg-blue-50 transition"
        >
          <ShieldCheck size={14} /> Verify
        </Link>

        <button
          onClick={() => alert(`Revoke certificate ${cert.id}`)}
          className="flex items-center justify-center gap-1 text-sm font-medium text-red-700 border border-red-600 rounded-md py-2 px-3 hover:bg-red-50 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
