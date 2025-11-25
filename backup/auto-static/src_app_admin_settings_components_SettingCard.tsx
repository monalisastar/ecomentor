'use client'

import { ReactNode } from 'react'

interface SettingCardProps {
  title: string
  description?: string
  children: ReactNode
}

/**
 * 🧱 SettingCard
 * ---------------------------------------------------------
 * A reusable layout wrapper for all admin settings panels.
 * Provides consistent styling, spacing, and card structure.
 */
export default function SettingCard({ title, description, children }: SettingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 transition hover:shadow-md">
      {/* 🏷️ Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1 leading-snug">{description}</p>
        )}
      </div>

      {/* ⚙️ Content Area */}
      <div className="mt-3">{children}</div>
    </div>
  )
}
