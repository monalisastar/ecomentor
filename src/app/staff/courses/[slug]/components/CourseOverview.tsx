'use client'

import { BadgeCheck, Clock, Layers, BookOpen } from 'lucide-react'

export interface CourseOverviewProps {
  slug: string
  title: string
  description?: string
  category?: string
  tier?: string
  scope?: string
  language?: string
  priceUSD?: number
  published?: boolean
  modulesCount?: number
  lessonsCount?: number
  onSave: () => Promise<void> | void
}

export default function CourseOverview({
  title,
  description,
  category,
  tier,
  scope,
  language = 'English',
  priceUSD,
  published,
  modulesCount,
  lessonsCount,
}: CourseOverviewProps) {
  return (
    <section className="relative w-full rounded-2xl p-6 sm:p-8 mb-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400">
          {title}
        </h2>

        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {published ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-400/40">
              <BadgeCheck size={16} />
              Published
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-sm border border-yellow-400/40">
              <Clock size={16} />
              Draft
            </span>
          )}
        </div>
      </div>

      {/* 🧩 Course details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-100/90 text-sm">
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Category</p>
          <p className="font-semibold">{category?.replace(/_/g, ' ') || '—'}</p>
        </div>
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Tier</p>
          <p className="font-semibold">{tier?.replace(/_/g, ' ') || '—'}</p>
        </div>
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Scope</p>
          <p className="font-semibold">{scope || '—'}</p>
        </div>
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Language</p>
          <p className="font-semibold">{language}</p>
        </div>
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Price (USD)</p>
          <p className="font-semibold">${priceUSD?.toFixed(2) || '—'}</p>
        </div>
        <div>
          <p className="text-gray-300 text-xs uppercase tracking-wide">Modules / Lessons</p>
          <p className="flex items-center gap-2 font-semibold">
            <Layers size={16} />
            {modulesCount ?? 0}
            <BookOpen size={16} className="ml-2" />
            {lessonsCount ?? 0}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-6 text-gray-300 text-sm leading-relaxed">{description}</p>
      )}
    </section>
  )
}
