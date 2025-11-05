'use client'

interface CertificateStatusBadgeProps {
  status: 'PENDING' | 'VERIFIED' | 'REVOKED'
}

export default function CertificateStatusBadge({ status }: CertificateStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'REVOKED':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'VERIFIED':
        return 'Verified'
      case 'REVOKED':
        return 'Revoked'
      case 'PENDING':
      default:
        return 'Pending'
    }
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  )
}
