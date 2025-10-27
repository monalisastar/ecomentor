'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'

type Props = {
  query: string
  setQuery: (val: string) => void
  progressFilter: string
  setProgressFilter: (val: string) => void
  certificationFilter: boolean
  setCertificationFilter: (val: boolean) => void
}

export default function LearningFilterBar({
  query,
  setQuery,
  progressFilter,
  setProgressFilter,
  certificationFilter,
  setCertificationFilter,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-center justify-between gap-5 transition-all duration-300">
      {/* 🔍 Search Box */}
      <div className="relative w-full md:w-1/2">
        <Search
          className="absolute left-4 top-3.5 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your enrolled courses..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 outline-none shadow-inner transition-all"
        />
      </div>

      {/* ⚙️ Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {/* ✅ Certification Filter */}
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={certificationFilter}
            onChange={(e) => setCertificationFilter(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 focus:ring-emerald-500 rounded-md border-gray-300 transition"
          />
          <span className="hover:text-emerald-700 transition-colors">
            Certified Only
          </span>
        </label>

        {/* 📊 Progress Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 focus:ring-2 focus:ring-emerald-400 transition-all"
          >
            <span>{progressFilter}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-44 overflow-hidden animate-fade-in-up">
              {['All', 'In Progress', 'Completed'].map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setProgressFilter(option)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    progressFilter === option
                      ? 'bg-emerald-50 text-emerald-600 font-medium'
                      : 'hover:bg-emerald-50 text-gray-700'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
