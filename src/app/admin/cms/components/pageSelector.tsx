'use client';

import React from 'react';

interface PageSelectorProps {
  pages: { title: string; slug: string }[];
  onSelect: (slug: string) => void;
  onNew: () => void;
}

export default function PageSelector({ pages, onSelect, onNew }: PageSelectorProps) {
  return (
    <div className="flex gap-3 mb-4 items-center">
      <select
        className="border p-2 rounded flex-1 bg-white shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Select Existing Page</option>
        {pages.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.title}
          </option>
        ))}
      </select>

      <button
        onClick={onNew}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md transition"
      >
        + New Page
      </button>
    </div>
  );
}
