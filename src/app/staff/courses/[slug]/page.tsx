'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Save,
  ArrowLeft,
  Globe,
  Eye,
  Upload,
  Loader2,
  Pencil,
  Trash2,
  RefreshCw,
  PlusCircle,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

export default function CourseEditorPage() {
  const { slug } = useParams()
  const router = useRouter()

  // 🧠 Course State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)

  // 📚 Modules + Lessons
  const [modules, setModules] = useState<any[]>([])
  const [loadingModules, setLoadingModules] = useState(true)

  // ➕ Add Module Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [creatingModule, setCreatingModule] = useState(false)

  // 🧩 Fetch modules + lessons
  const fetchModules = async () => {
    try {
      setLoadingModules(true)
      const res = await fetch(`/api/modules?courseSlug=${slug}`)
      const data = await res.json()

      const modulesArray = Array.isArray(data)
        ? data
        : Array.isArray(data.modules)
        ? data.modules
        : []

      setModules(modulesArray)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch modules.')
      setModules([])
    } finally {
      setLoadingModules(false)
    }
  }

  useEffect(() => {
    fetchModules()
    window.addEventListener('imported', fetchModules)
    return () => window.removeEventListener('imported', fetchModules)
  }, [slug])

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
      if (data.success) toast.success('✅ Course saved successfully!')
      else toast.error('⚠️ Failed to save course.')
    } catch (error) {
      console.error(error)
      toast.error('❌ Error saving course.')
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
        toast.success('🎉 Course published successfully!')
      } else toast.error('⚠️ Failed to publish course.')
    } catch (error) {
      console.error(error)
      toast.error('❌ Error publishing course.')
    } finally {
      setIsPublishing(false)
    }
  }

  // 🧩 Auto Import Logic
  const handleAutoImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const confirmUpload = confirm(
      `Upload "${file.name}" and auto-import modules and lessons?`
    )
    if (!confirmUpload) return

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setProgress(0)

    try {
      const res = await fetch(`/api/staff/courses/${slug}/import`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || '✅ Import completed successfully!')
        await fetchModules()
      } else toast.error(data.error || '⚠️ Import failed.')
    } catch (err) {
      console.error(err)
      toast.error('❌ Error uploading file.')
    } finally {
      setUploading(false)
      setProgress(null)
      e.target.value = ''
    }
  }

  // ➕ Create Module Manually
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error('Module title is required.')
      return
    }
    setCreatingModule(true)
    try {
      // ✅ Use existing API route
      const courseRes = await fetch(`/api/courses/${slug}`)
      const courseData = await courseRes.json()
      if (!courseRes.ok || !courseData?.id) {
        toast.error('❌ Course not found or invalid slug.')
        setCreatingModule(false)
        return
      }

      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseData.id,
          title: newModuleTitle.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('✅ Module added successfully!')
        setShowAddModal(false)
        setNewModuleTitle('')
        await fetchModules()
      } else toast.error(data.error || '⚠️ Failed to add module.')
    } catch (err) {
      console.error(err)
      toast.error('❌ Error adding module.')
    } finally {
      setCreatingModule(false)
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
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
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
        <h2 className="text-lg font-semibold text-gray-900">Course Information</h2>
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

      {/* 🧩 Auto-Import */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Upload size={18} className="text-green-600" /> Auto-Import Course
        </h2>
        <p className="text-sm text-gray-600">
          Upload <b>.pptx</b>, <b>.pdf</b>, <b>.docx</b>, or <b>.zip</b> to generate
          modules, lessons & content automatically.
        </p>

        <div className="flex items-center gap-3 border p-3 rounded-md bg-gray-50">
          <input
            type="file"
            id="autoImportFile"
            accept=".pptx,.pdf,.docx,.zip"
            className="border p-2 rounded text-sm"
            onChange={handleAutoImport}
            disabled={uploading}
          />
          <button
            disabled={uploading}
            onClick={() => document.getElementById('autoImportFile')?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Importing...
              </>
            ) : (
              <>
                <Upload size={16} /> Import
              </>
            )}
          </button>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress || 100}%` }}
            />
          </div>
        )}
      </section>

      {/* 📚 Modules & Lessons */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📚 Course Modules
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-green-700 hover:text-green-900 flex items-center gap-1 text-sm font-medium"
            >
              <PlusCircle size={16} /> Add Module
            </button>
            <button
              onClick={fetchModules}
              disabled={loadingModules}
              className="text-gray-600 hover:text-green-700 flex items-center gap-2 text-sm"
            >
              <RefreshCw
                className={loadingModules ? 'animate-spin' : ''}
                size={16}
              />
              Refresh
            </button>
          </div>
        </div>

        {loadingModules ? (
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Loader2 className="animate-spin" size={14} /> Loading modules...
          </p>
        ) : !Array.isArray(modules) || modules.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No modules yet. Use Auto-Import or add one manually.
          </p>
        ) : (
          <div className="space-y-6">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{mod.title}</h3>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {Array.isArray(mod.lessons) && mod.lessons.length > 0 ? (
                  <ul className="space-y-2 pl-4">
                    {mod.lessons.map((lesson: any) => (
                      <li
                        key={lesson.id}
                        className="p-3 bg-white border rounded-md hover:bg-gray-100 transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            {lesson.title}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                            <Eye size={12} /> Preview
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm pl-4">No lessons found.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🚀 Publish & Preview */}
      <section className="border-t border-gray-200 pt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/staff/courses/${slug}/preview?id=${slug}`)}
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

      {/* ➕ Add Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Module
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Title
              </label>
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Enter module title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddModule}
                disabled={creatingModule}
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {creatingModule ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} /> Add Module
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
