"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

type Props = {
  query: string
  setQuery: (value: string) => void
  onSortChange?: (value: string) => void
  onCategoryChange?: (value: string) => void
}

export default function SearchBar({
  query,
  setQuery,
  onSortChange,
  onCategoryChange,
}: Props) {
  const [showClear, setShowClear] = useState(false)

  const handleChange = (val: string) => {
    setQuery(val)
    setShowClear(val.length > 0)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      {/* Search box */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search courses..."
          className="pl-10 pr-8 py-2 w-full border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        {showClear && (
          <button
            onClick={() => handleChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <select
        onChange={(e) => onCategoryChange?.(e.target.value)}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">All Categories</option>
        <option value="policy">Climate Policy</option>
        <option value="carbon">Carbon Markets</option>
        <option value="tech">Green Tech</option>
      </select>

      {/* Sort filter */}
      <select
        onChange={(e) => onSortChange?.(e.target.value)}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
      >
        <option value="popular">Most Popular</option>
        <option value="rating">Highest Rated</option>
        <option value="duration">Shortest Duration</option>
        <option value="new">Newest</option>
      </select>
    </div>
  )
}
