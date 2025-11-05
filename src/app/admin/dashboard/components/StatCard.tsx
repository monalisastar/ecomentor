'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <Icon size={20} className="text-green-700" />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
    </div>
  )
}
