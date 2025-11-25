'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Ban,
  RefreshCw,
  AlertTriangle,
  Coins,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface Certificate {
  id: string
  studentName: string
  courseTitle: string
  studentWallet?: string
  metadataURI?: string
  status: 'PENDING' | 'VERIFIED' | 'REVOKED'
  blockchainTx?: string | null
  blockchainNetwork?: string | null
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
  const [syncing, setSyncing] = useState(false)

  // 🔧 Verify / Revoke / Restore
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
        newStatus === 'VERIFIED'
          ? '✅ Certificate verified successfully.'
          : newStatus === 'REVOKED'
          ? '❌ Certificate revoked successfully.'
          : '🕓 Certificate restored to pending.'
      )
      onActionDone()
      setConfirmAction({ type: null, title: '' })
    } catch (err: any) {
      toast.error(err.message)
      console.error('❌ Status update failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🌐 Polygon Explorer
  const getExplorerLink = (tx: string, network?: string | null) => {
    if (!tx) return '#'
    return network === 'polygon-amoy'
      ? `https://amoy.polygonscan.com/tx/${tx}`
      : `https://polygonscan.com/tx/${tx}`
  }

  // 🪙 Mint on-chain (org wallet)
  const handleMint = async () => {
    console.log('🟢 Mint button clicked!', certificate)
    try {
      setMinting(true)
      toast.loading('⛓️ Minting certificate on blockchain...')

      const res = await fetch(`/api/certificates/mint/${certificate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataURI: certificate.metadataURI,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Minting failed')

      toast.dismiss()
      const txHash = data.certificate?.blockchainTx
      const explorer = getExplorerLink(txHash, data.certificate?.blockchainNetwork)

      toast.success(
        <div className="flex flex-col items-start gap-1">
          <span>✅ Minted to Eco-Mentor wallet!</span>
          {txHash && (
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs font-medium"
            >
              View Transaction <ExternalLink size={12} />
            </a>
          )}
        </div>
      )

      // 🕓 Ensure database is synced before refreshing
      setSyncing(true)
      toast.loading('Syncing blockchain record...')
      await new Promise((r) => setTimeout(r, 2000))

      // ✅ Now safely refresh the table
      onActionDone()
      setSyncing(false)
      toast.dismiss()
      toast.success('✅ Certificate synced successfully!')
    } catch (err: any) {
      toast.dismiss()
      console.error('💥 Mint error:', err)
      toast.error(err.message || 'Minting failed.')
    } finally {
      setMinting(false)
      setSyncing(false)
    }
  }

  // 🧩 Reusable Button
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
      {disabled ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  )

  const normalizedStatus = certificate.status?.toUpperCase()

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* ✅ Verify */}
        {normalizedStatus !== 'VERIFIED' && (
          <ActionButton
            label="Verify"
            color="bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
            icon={CheckCircle2}
            onClick={() =>
              setConfirmAction({ type: 'VERIFY', title: 'Verify this certificate?' })
            }
            disabled={loading || minting || syncing}
          />
        )}

        {/* 🔴 Revoke */}
        {normalizedStatus !== 'REVOKED' && (
          <ActionButton
            label="Revoke"
            color="bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
            icon={Ban}
            onClick={() =>
              setConfirmAction({ type: 'REVOKE', title: 'Revoke this certificate?' })
            }
            disabled={loading || minting || syncing}
          />
        )}

        {/* 🔄 Restore */}
        {normalizedStatus === 'REVOKED' && (
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
            disabled={loading || minting || syncing}
          />
        )}

        {/* 🪙 Mint on Blockchain */}
        {normalizedStatus === 'VERIFIED' && (
          <ActionButton
            label={minting ? 'Minting...' : syncing ? 'Syncing...' : 'Mint on Blockchain'}
            color="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
            icon={Coins}
            onClick={handleMint}
            disabled={minting || syncing || loading}
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
