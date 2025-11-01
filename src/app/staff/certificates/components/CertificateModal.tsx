'use client'

import { useState } from 'react'
import { Award, Loader2, ShieldCheck, X, Trash2 } from 'lucide-react'

interface CertificateModalProps {
  open: boolean
  onClose: () => void
  studentName: string
  courseTitle: string
  certificateUrl?: string
}

export default function CertificateModal({
  open,
  onClose,
  studentName,
  courseTitle,
  certificateUrl,
}: CertificateModalProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'issued' | 'revoked' | 'verified'>('idle')

  if (!open) return null

  // 🧩 Mock backend calls (replace with real API later)
  const handleIssue = async () => {
    setLoading(true)
    setTimeout(() => {
      setStatus('issued')
      setLoading(false)
    }, 1500)
  }

  const handleRevoke = async () => {
    setLoading(true)
    setTimeout(() => {
      setStatus('revoked')
      setLoading(false)
    }, 1500)
  }

  const handleVerify = async () => {
    setLoading(true)
    setTimeout(() => {
      setStatus('verified')
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-green-700" size={22} />
          <h2 className="text-lg font-semibold text-gray-900">
            Certificate Management
          </h2>
        </div>

        {/* Student + Course Info */}
        <p className="text-gray-700 text-sm mb-2">
          <span className="font-medium">Student:</span> {studentName}
        </p>
        <p className="text-gray-700 text-sm mb-4">
          <span className="font-medium">Course:</span> {courseTitle}
        </p>

        {/* Status Feedback */}
        {status !== 'idle' && (
          <div
            className={`p-2 mb-4 rounded-lg text-sm ${
              status === 'issued'
                ? 'bg-green-100 text-green-700'
                : status === 'revoked'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {status === 'issued' && 'Certificate successfully issued!'}
            {status === 'revoked' && 'Certificate revoked.'}
            {status === 'verified' && 'Certificate verified successfully!'}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-4 text-gray-600">
              <Loader2 size={20} className="animate-spin" /> Processing...
            </div>
          ) : (
            <>
              <button
                onClick={handleIssue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Award size={16} /> Issue Certificate
              </button>

              <button
                onClick={handleVerify}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <ShieldCheck size={16} /> Verify Certificate
              </button>

              <button
                onClick={handleRevoke}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={16} /> Revoke Certificate
              </button>

              {certificateUrl && (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-green-700 mt-2 hover:underline"
                >
                  View existing certificate
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
