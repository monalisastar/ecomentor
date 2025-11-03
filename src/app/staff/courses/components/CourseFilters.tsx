'use client'

import { Dispatch, SetStateAction } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export interface Filters {
  search: string
  category: string
  scope: string
  published: string
}

interface CourseFiltersProps {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

export default function CourseFilters({ filters, setFilters }: CourseFiltersProps) {
  // 🔹 Handle filter updates
  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <section className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-gray-200 pb-3">
      {/* 🔍 Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <Input
          placeholder="Search by course title..."
          className="pl-9 w-full"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      {/* 🧠 Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(v) => updateFilter('category', v)}
      >
        <SelectTrigger className="w-[200px]">
          <Filter size={16} className="mr-2 text-gray-500" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GHG_ACCOUNTING">GHG Accounting</SelectItem>
          <SelectItem value="CARBON_PROJECT_DEVELOPMENT">
            Carbon Project Development
          </SelectItem>
          <SelectItem value="CARBON_MARKETS">Carbon Markets</SelectItem>
          <SelectItem value="CLIMATE_FINANCE">Climate Finance</SelectItem>
          <SelectItem value="SUSTAINABLE_AGRICULTURE">
            Sustainable Agriculture
          </SelectItem>
          <SelectItem value="ENERGY_EFFICIENCY">Energy Efficiency</SelectItem>
        </SelectContent>
      </Select>

      {/* 🌍 Scope Filter */}
      <Select
        value={filters.scope}
        onValueChange={(v) => updateFilter('scope', v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SCOPE1">Scope 1</SelectItem>
          <SelectItem value="SCOPE2">Scope 2</SelectItem>
          <SelectItem value="SCOPE3">Scope 3</SelectItem>
          <SelectItem value="CROSS_SCOPE">Cross-scope</SelectItem>
        </SelectContent>
      </Select>

      {/* 🚀 Published Filter */}
      <Select
        value={filters.published}
        onValueChange={(v) => updateFilter('published', v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Published</SelectItem>
          <SelectItem value="false">Draft</SelectItem>
        </SelectContent>
      </Select>
    </section>
  )
}
