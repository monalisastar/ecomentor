'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// 🧩 Modular Components
import PageSelector from './components/PageSelector';
import EditorForm from './components/EditorForm';
import RichTextEditor from './components/RichTextEditor';
import SaveButton from './components/SaveButton';

export default function CmsManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [showInMenu, setShowInMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'PAGE' | 'BLOG'>('PAGE'); // 🆕 Mode switch

  // 🧠 Fetch all CMS items
  useEffect(() => {
    fetch('/api/pages')
      .then((res) => res.json())
      .then(setPages)
      .catch(() => toast.error('Failed to load content'));
  }, [mode]); // reload when switching modes

  // 🧩 Load one item for editing
  async function loadItem(slug: string) {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}`);
      const data = await res.json();
      setSelected(slug);
      setTitle(data.title);
      setSlug(data.slug);
      setContent(data.content);
      setShowInMenu(data.showInMenu);
      setMenuLabel(data.menuLabel || '');
    } catch {
      toast.error('Failed to load item');
    }
    setLoading(false);
  }

  // 💾 Save or update
  async function handleSave() {
    if (!title || !slug) {
      toast.error('Title and slug are required');
      return;
    }

    setLoading(true);
    const method = selected ? 'PATCH' : 'POST';
    const url = selected ? `/api/pages/${slug}` : '/api/pages';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          showInMenu,
          menuLabel,
          type: mode, // 🆕 PAGE or BLOG
        }),
      });

      if (res.ok) {
        toast.success(`${mode === 'PAGE' ? 'Page' : 'Blog'} saved!`);
        const refreshed = await fetch('/api/pages').then((r) => r.json());
        setPages(refreshed);
      } else {
        toast.error('Save failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // 🧹 Reset for new item
  function resetForm() {
    setSelected('');
    setTitle('');
    setSlug('');
    setContent('');
    setShowInMenu(false);
    setMenuLabel('');
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Eco-Mentor CMS Editor</h1>
      <p className="text-gray-500 mb-6">
        Manage pages and blog content dynamically — without touching static files.
      </p>

      {/* 🪶 Mode Switch Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('PAGE')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === 'PAGE'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Pages
        </button>

        <button
          onClick={() => setMode('BLOG')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === 'BLOG'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Blogs
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
        {/* Page/Blog Selector */}
        <PageSelector pages={pages.filter((p) => p.type === mode)} onSelect={loadItem} onNew={resetForm} />

        {/* Info Form */}
        <EditorForm
          title={title}
          slug={slug}
          showInMenu={showInMenu}
          menuLabel={menuLabel}
          onTitleChange={setTitle}
          onSlugChange={setSlug}
          onShowInMenuChange={setShowInMenu}
          onMenuLabelChange={setMenuLabel}
        />

        {/* Rich Editor */}
        <RichTextEditor value={content} onChange={setContent} />

        {/* Save Button */}
        <div className="pt-4">
          <SaveButton loading={loading} onClick={handleSave} label={`Save ${mode === 'PAGE' ? 'Page' : 'Blog'}`} />
        </div>
      </div>
    </div>
  );
}
