'use client'

import { Award } from 'lucide-react'

export default function CertificationHeader() {
  return (
    <div className="space-y-2 text-center md:text-left">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
        My Certifications <Award className="text-green-600" size={26} />
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto md:mx-0">
        View and manage all your earned certifications. You can download or share
        them anytime.
      </p>
    </div>
  )
}
