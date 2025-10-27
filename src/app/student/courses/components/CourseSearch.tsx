'use client'

interface CourseSearchProps {
  query: string
  setQuery: (value: string) => void
}

export default function CourseSearch({ query, setQuery }: CourseSearchProps) {
  return (
    <div className="w-full md:w-1/2">
      <input
        type="text"
        placeholder="Search for a course e.g. Carbon Accounting, Climate Finance..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}
