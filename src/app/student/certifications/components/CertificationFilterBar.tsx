'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

type Props = {
  query: string
  setQuery: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
}

export default function CertificationFilterBar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* 🔍 Search Box */}
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search certifications..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* ⚙️ Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <Filter size={16} /> Status ▾
        </button>

        {open && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-20 w-44">
            {['All', 'Verified', 'In Progress', 'Expired'].map((option) => (
              <div
                key={option}
                onClick={() => {
                  setStatusFilter(option)
                  setOpen(false)
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-green-50 ${
                  statusFilter === option
                    ? 'text-green-600 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
