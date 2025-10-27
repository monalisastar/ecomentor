'use client'

interface Props {
  filter: string
  setFilter: (f: string) => void
}

const filters = [
  'All',
  'Foundational',
  'Professional',
  'Sectoral',
  'Policy',
  'Blockchain',
]

export default function CourseFilterBar({ filter, setFilter }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            filter === f
              ? 'bg-green-500 text-white border-green-500'
              : 'border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
