import { GraduationCap } from 'lucide-react'

export default function ProfileStats({
  totalEnrollments,
  totalCertificates,
}: {
  totalEnrollments: number
  totalCertificates: number
}) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <GraduationCap className="text-purple-600" />
      <div>
        <p className="text-xs text-gray-500">Learning Stats</p>
        <p className="text-lg font-medium">
          {totalEnrollments} enrollments · {totalCertificates} certificates
        </p>
      </div>
    </div>
  )
}
