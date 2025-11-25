'use client'

import { useState } from 'react'
import { CheckCircle2, Ban, RefreshCw, AlertTriangle, Coins } from 'lucide-react'
import { toast } from 'sonner'

interface Certificate {
  id: string
  studentName: string
  courseTitle: string
  studentWallet?: string
  metadataURI?: string
  status: 'PENDING' | 'VERIFIED' | 'REVOKED'
}

interface Props {
  certificate: Certificate
  onActionDone: () => void
}

export default function CertificateActions({ certificate, onActionDone }: Props) {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'VERIFY' | 'REVOKE' | 'RESTORE' | null
    title: string
  }>({ type: null, title: '' })
  const [loading, setLoading] = useState(false)
  const [minting, setMinting] = useState(false)

  // 🔧 Update backend certificate status
  const handleAction = async (newStatus: 'VERIFIED' | 'REVOKED' | 'PENDING') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/certificates/${certificate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update certificate status')
      }

      toast.success(
        `Certificate ${
          newStatus === 'VERIFIED'
            ? 'verified successfully.'
            : newStatus === 'REVOKED'
            ? 'revoked successfully.'
            : 'restored to pending.'
        }`
      )

      onActionDone()
      setConfirmAction({ type: null, title: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 🪙 Mint blockchain certificate
  const handleMint = async () => {
    if (!certificate.studentWallet || !certificate.metadataURI) {
      toast.error('Missing student wallet or metadata URI.')
      return
    }

    try {
      setMinting(true)
      const res = await fetch(`/api/certificates/mint/${certificate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: certificate.studentWallet,
          metadataURI: certificate.metadataURI,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`✅ Minted on Polygon! Tx: ${data.txHash}`)
        onActionDone()
      } else {
        toast.error(`❌ ${data.error || 'Minting failed'}`)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setMinting(false)
    }
  }

  // 🧩 Reusable button
  const ActionButton = ({
    label,
    color,
    icon: Icon,
    onClick,
    disabled,
  }: {
    label: string
    color: string
    icon: any
    onClick: () => void
    disabled?: boolean
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${color} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <Icon size={14} /> {label}
    </button>
  )

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* ✅ Verify */}
        {certificate.status !== 'VERIFIED' && (
          <ActionButton
            label="Verify"
            color="bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
            icon={CheckCircle2}
            onClick={() =>
              setConfirmAction({ type: 'VERIFY', title: 'Verify this certificate?' })
            }
            disabled={loading || minting}
          />
        )}

        {/* 🔴 Revoke */}
        {certificate.status !== 'REVOKED' && (
          <ActionButton
            label="Revoke"
            color="bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
            icon={Ban}
            onClick={() =>
              setConfirmAction({ type: 'REVOKE', title: 'Revoke this certificate?' })
            }
            disabled={loading || minting}
          />
        )}

        {/* 🔄 Restore */}
        {certificate.status === 'REVOKED' && (
          <ActionButton
            label="Restore"
            color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
            icon={RefreshCw}
            onClick={() =>
              setConfirmAction({
                type: 'RESTORE',
                title: 'Restore this certificate to pending?',
              })
            }
            disabled={loading || minting}
          />
        )}

        {/* 🪙 Mint on Blockchain */}
        {certificate.status === 'VERIFIED' && (
          <ActionButton
            label={minting ? 'Minting...' : 'Mint on Blockchain'}
            color="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
            icon={Coins}
            onClick={handleMint}
            disabled={minting || loading}
          />
        )}
      </div>

      {/* ⚠️ Confirmation Modal */}
      {confirmAction.type && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <AlertTriangle className="text-yellow-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">{confirmAction.title}</h2>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to{' '}
              {confirmAction.type === 'VERIFY'
                ? 'verify'
                : confirmAction.type === 'REVOKE'
                ? 'revoke'
                : 'restore'}{' '}
              the certificate for{' '}
              <span className="font-medium text-gray-800">
                {certificate.studentName}
              </span>{' '}
              ({certificate.courseTitle})?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (!confirmAction.type) return
                  handleAction(
                    confirmAction.type === 'VERIFY'
                      ? 'VERIFIED'
                      : confirmAction.type === 'REVOKE'
                      ? 'REVOKED'
                      : 'PENDING'
                  )
                }}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmAction.type === 'REVOKE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmAction.type === 'VERIFY'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmAction({ type: null, title: '' })}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
