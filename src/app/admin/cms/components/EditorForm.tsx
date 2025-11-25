'use client';

import React from 'react';

interface EditorFormProps {
  title: string;
  slug: string;
  showInMenu: boolean;
  menuLabel: string;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onShowInMenuChange: (v: boolean) => void;
  onMenuLabelChange: (v: string) => void;
}

export default function EditorForm({
  title,
  slug,
  showInMenu,
  menuLabel,
  onTitleChange,
  onSlugChange,
  onShowInMenuChange,
  onMenuLabelChange,
}: EditorFormProps) {
  return (
    <div className="space-y-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Page Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter page title (e.g. About Eco-Mentor)"
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Page Slug
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="e.g. about-us"
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showInMenu}
          onChange={(e) => onShowInMenuChange(e.target.checked)}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label className="text-sm text-gray-700">
          Show this page in Navbar Menu
        </label>
      </div>

      {showInMenu && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Menu Label (optional)
          </label>
          <input
            type="text"
            value={menuLabel}
            onChange={(e) => onMenuLabelChange(e.target.value)}
            placeholder="e.g. Blog, Impact, Partners"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
      )}
    </div>
  );
}
