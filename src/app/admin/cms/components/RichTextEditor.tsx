'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// 🆕 Use the React-18-safe fork
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// 🧩 Dynamically import the safe version
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Page Content
      </label>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="rounded-md"
      />
    </div>
  );
}
