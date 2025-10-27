'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 🧩 Props type definition
type SearchBarProps = {
  disabled?: boolean;
};

export default function SearchBar({ disabled = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowDropdown(true);

    try {
      const res = await fetch(`/api/courses?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/courses/${slug}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      {/* 🔍 Search form */}
      <form
        onSubmit={handleSearch}
        className={`flex items-center gap-3 bg-white shadow-sm border border-gray-200 rounded-xl px-4 py-3 ${
          disabled ? 'opacity-70 pointer-events-none' : ''
        }`}
      >
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a course e.g. Carbon Accounting, Climate Finance..."
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
          disabled={disabled}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          disabled={loading || disabled}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* 📋 Dropdown results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-xl mt-1 shadow-lg z-20">
          {results.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelect(course.slug)}
              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-700"
            >
              {course.title}
            </div>
          ))}
        </div>
      )}

      {/* 🕳 Empty state */}
      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-xl mt-1 shadow-sm text-gray-500 text-sm p-3">
          No courses found.
        </div>
      )}
    </div>
  );
}
