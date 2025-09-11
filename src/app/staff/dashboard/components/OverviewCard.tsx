'use client'

import { useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Users, Book, Clipboard } from 'lucide-react'

interface OverviewCardProps {
  title: string
  value: number | string
  trendData?: { value: number }[]
  icon?: JSX.Element
  colorClass?: string
  tooltipText?: string
  ctaText?: string
  onCTA?: () => void
}

export default function OverviewCard({
  title,
  value,
  trendData,
  icon,
  colorClass = 'bg-green-500',
  tooltipText,
  ctaText,
  onCTA
}: OverviewCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`p-4 rounded-xl shadow-lg text-white relative overflow-hidden transition transform hover:scale-105 ${colorClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{icon || <Users />}</div>
        <div>
          <p className="text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>

      {trendData && trendData.length > 0 && (
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tooltipText && hovered && (
        <div className="absolute top-0 right-0 bg-black/70 px-2 py-1 rounded text-xs">
          {tooltipText}
        </div>
      )}

      {ctaText && hovered && onCTA && (
        <button
          onClick={onCTA}
          className="mt-3 px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-sm transition"
        >
          {ctaText}
        </button>
      )}
    </div>
  )
}
