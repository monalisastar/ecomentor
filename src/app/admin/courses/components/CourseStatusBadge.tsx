'use client'

interface Props {
  status: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED' | string
}

export default function CourseStatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700 border border-green-300',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    REVOKED: 'bg-red-100 text-red-700 border border-red-300',
  }

  const labelMap: Record<string, string> = {
    APPROVED: 'Approved',
    UNDER_REVIEW: 'Under Review',
    REVOKED: 'Revoked',
  }

  const appliedStyle =
    styles[status] || 'bg-gray-100 text-gray-600 border border-gray-200'

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${appliedStyle}`}
    >
      {labelMap[status] || 'Unknown'}
    </span>
  )
}
