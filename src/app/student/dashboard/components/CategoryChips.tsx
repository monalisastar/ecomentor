'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  'All',
  'Climate Change',
  'Carbon Markets',
  'GHG Accounting',
  'Sustainability',
  'Renewable Energy',
  'Circular Economy',
  'Policy & Governance',
];

export default function CategoryChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategoryClick(cat)}
          className={`px-4 py-2 rounded-full border text-sm transition
            ${
              activeCategory === cat
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
