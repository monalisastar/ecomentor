'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageSelector from './components/pageSelector';
import SaveButton from './components/SaveButton';

/**
 * 🌿 Eco-Mentor CMS Manager (Live Preview)
 * -------------------------------------------------------
 * - Edits static + DB-merged content per page
 * - Adds real-time visual preview (iframe)
 * -------------------------------------------------------
 */
export default function CmsManager() {
  const [pages] = useState([
    { slug: 'home', title: 'Home' },
    { slug: 'about-us', title: 'About Us' },
    { slug: 'faq', title: 'FAQ' },
    { slug: 'shop', title: 'Shop' },
  ]);

  const [selected, setSelected] = useState('');
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 🔁 For iframe reload

  // 🧠 Load merged page sections
  async function loadPage(slug: string) {
    if (!slug) return;
    setSelected(slug);
    setLoading(true);
    try {
      const res = await fetch(`/api/sections/${slug}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setSections(data);
    } catch {
      toast.error('Failed to load page sections');
    } finally {
      setLoading(false);
    }
  }

  // 💾 Save one section
  async function saveSection(key: string, content: any) {
    try {
      const res = await fetch('/api/cms/update-section', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug: selected, sectionKey: key, content }),
      });
      if (!res.ok) throw new Error();
      toast.success(`✅ Saved section: ${key}`);

      // 🔁 Refresh live preview
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error('❌ Failed to save section');
    }
  }

  // 🧩 Render editors
  const renderSectionEditors = () =>
    Object.entries(sections).map(([key, value]) => (
      <div key={key} className="bg-white p-5 border rounded-lg shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">{key}</h3>
          <SaveButton loading={false} onClick={() => saveSection(key, value)} label="Save Section" />
        </div>

        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setSections((prev) => ({ ...prev, [key]: parsed }));
            } catch {
              // ignore invalid JSON
            }
          }}
          rows={10}
          className="w-full font-mono text-sm border border-gray-300 rounded-md p-3 focus:ring-green-600"
        />
      </div>
    ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 max-w-7xl mx-auto">
      {/* 🧩 LEFT: Editor Panel */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Eco-Mentor CMS Editor</h1>
        <p className="text-gray-500 mb-4">
          Edit live sections from your site — instantly preview changes.
        </p>

        <PageSelector pages={pages} onSelect={loadPage} onNew={() => setSelected('')} />

        {loading && <p className="text-gray-400 italic">Loading sections...</p>}

        {!loading && selected && Object.keys(sections).length > 0 && (
          <div className="space-y-6">{renderSectionEditors()}</div>
        )}
      </div>

      {/* 🪞 RIGHT: Live Preview */}
      {selected && (
        <div className="rounded-lg overflow-hidden border shadow-inner relative bg-gray-100">
          <div className="absolute top-0 left-0 right-0 bg-green-700 text-white text-sm px-3 py-1 z-10">
            Live Preview — {selected.toUpperCase()}
          </div>
          <iframe
            key={refreshKey}
            src={`/${selected === 'home' ? '' : selected}?preview=true`}
            className="w-full h-[85vh] border-none"
          />
        </div>
      )}
    </div>
  );
}
