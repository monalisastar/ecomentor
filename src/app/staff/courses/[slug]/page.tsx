'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, ArrowLeft, Globe, Eye, Upload } from 'lucide-react'
import Link from 'next/link'
import ModuleManager from './components/ModuleManager'

export default function CourseEditorPage() {
  const { slug } = useParams()
  const router = useRouter()

  // 🧠 Course State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  // 💾 Save Draft
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/staff/courses/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, description }),
      })
      const data = await res.json()
      if (data.success) alert('✅ Course saved successfully!')
      else alert('⚠️ Failed to save course.')
    } catch (error) {
      console.error(error)
      alert('❌ Error saving course.')
    } finally {
      setIsSaving(false)
    }
  }

  // 🌍 Publish Course
  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this course?')) return
    setIsPublishing(true)
    try {
      const res = await fetch('/api/staff/courses/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, description }),
      })
      const data = await res.json()
      if (data.success) {
        setPublished(true)
        alert('🎉 Course published successfully!')
      } else alert('⚠️ Failed to publish course.')
    } catch (error) {
      console.error(error)
      alert('❌ Error publishing course.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-[88px] sm:pt-[96px] space-y-10 transition-all duration-300">
      {/* 🔙 Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/staff/courses"
            className="text-gray-600 hover:text-green-700 transition flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Course — {title || slug?.toString().replace(/-/g, ' ')}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* 📘 Status */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Status:{' '}
          {published ? (
            <span className="text-green-600 font-medium">Published</span>
          ) : (
            <span className="text-yellow-600 font-medium">Draft</span>
          )}
        </p>
        {published && (
          <button
            onClick={() => router.push(`/courses/${slug}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Globe size={14} /> View Live Course
          </button>
        )}
      </div>

      {/* 🧾 Course Info */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Course Information
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed course description"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* 🧩 Auto-Import Course */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Upload size={18} className="text-green-600" /> Auto-Import Course
        </h2>
        <p className="text-sm text-gray-600">
          Upload a <b>.pptx</b>, <b>.pdf</b>, <b>.docx</b>, or <b>.zip</b> file
          to automatically generate modules and lessons.
        </p>

        {/* 📦 Upload Form */}
        <form
          action={`/api/staff/courses/${slug}/import`}
          method="post"
          encType="multipart/form-data"
          onSubmit={() =>
            // 🔄 Trigger refresh event ~6 seconds after upload (adjust if needed)
            setTimeout(() => window.dispatchEvent(new Event('imported')), 6000)
          }
          className="flex items-center gap-3 border p-3 rounded-md bg-gray-50"
        >
          <input
            type="file"
            name="file"
            accept=".pptx,.pdf,.docx,.zip"
            required
            className="border p-2 rounded text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Upload size={16} /> Import
          </button>
        </form>
      </section>

      {/* 📚 Modules */}
      <section>
        <ModuleManager />
      </section>

      {/* 🚀 Publish & Preview */}
      <section className="border-t border-gray-200 pt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/staff/courses/${slug}/preview`)}
          className="flex items-center gap-2 px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          <Eye size={18} />
          Preview
        </button>

        <button
          onClick={handlePublish}
          disabled={published || isPublishing}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white transition ${
            published
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <Globe size={18} />
          {published ? 'Published' : isPublishing ? 'Publishing...' : 'Publish'}
        </button>
      </section>
    </main>
  )
}
