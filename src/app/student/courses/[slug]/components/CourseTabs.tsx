'use client'

import { useState, useEffect, useMemo } from 'react'
import { FileText, User, Link as LinkIcon, Download, Eye } from 'lucide-react'

interface CourseTabsProps {
  about: string
  instructor: {
    name: string
    bio: string
    avatar?: string
  }
  resources?: { title: string; url: string }[]
  fileUrl?: string | null
  fileName?: string | null
}

export default function CourseTabs({
  about,
  instructor,
  resources = [],
  fileUrl,
  fileName,
}: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'instructor' | 'resources'>('about')
  const [downloading, setDownloading] = useState(false)
  const [displayResources, setDisplayResources] = useState<{ title: string; url: string }[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 🧠 Memoize resources to prevent re-creation on every render
  const stableResources = useMemo(() => {
    if (Array.isArray(resources) && resources.length > 0) {
      return [...resources]
    }
    return null
  }, [JSON.stringify(resources)]) // deep compare to detect real content changes

  // 🧩 Collect all available resources once data is stable
  useEffect(() => {
    if (stableResources) {
      setDisplayResources(stableResources)
    } else if (fileUrl) {
      setDisplayResources([{ title: fileName || 'Lesson Resource File', url: fileUrl }])
    } else {
      setDisplayResources([])
    }
  }, [stableResources, fileUrl, fileName])

  const tabs = [
    { key: 'about', label: 'About this Lesson', icon: <FileText size={16} /> },
    { key: 'instructor', label: 'Instructor', icon: <User size={16} /> },
    { key: 'resources', label: 'Resources', icon: <LinkIcon size={16} /> },
  ]

  const handleDownloadAll = async () => {
    if (!displayResources.length) return
    setDownloading(true)
    try {
      for (const res of displayResources) {
        const link = document.createElement('a')
        link.href = res.url
        link.download = res.title || 'resource'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('❌ Download failed:', err)
      alert('Some resources could not be downloaded automatically.')
    } finally {
      setDownloading(false)
    }
  }

  const isPreviewable = (url: string) => /\.(pdf|png|jpg|jpeg|gif)$/i.test(url)

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 🧭 Tabs Header */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 📘 Tab Content */}
      <div className="p-6">
        {/* 🧩 About Section */}
        {activeTab === 'about' && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lesson Overview</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {about?.trim() || 'No description available for this lesson.'}
            </p>
          </section>
        )}

        {/* 👨 Instructor Section */}
        {activeTab === 'instructor' && (
          <section className="flex items-start gap-4">
            {instructor.avatar ? (
              <img
                src={instructor.avatar}
                alt={instructor.name || 'Instructor'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                {instructor.name?.charAt(0) || 'I'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {instructor.name || 'Instructor'}
              </h3>
              <p className="text-gray-600 leading-relaxed mt-2">
                {instructor.bio?.trim() || 'Instructor details will be provided soon.'}
              </p>
            </div>
          </section>
        )}

        {/* 📎 Resources Section */}
        {activeTab === 'resources' && (
          <section>
            {displayResources.length > 0 ? (
              <>
                <ul className="space-y-3 mb-6">
                  {displayResources.map((res, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                      >
                        <LinkIcon size={14} />
                        {res.title}
                      </a>
                      {isPreviewable(res.url) && (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(res.url)}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600"
                        >
                          <Eye size={14} /> Preview
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {/* 🟩 Download All */}
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloading ? 'Downloading...' : 'Download All Resources'}
                </button>

                {/* 👁️ File Preview Modal */}
                {previewUrl && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 shadow-lg p-4 relative">
                      <button
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>

                      {previewUrl.endsWith('.pdf') ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-[70vh] border rounded-md"
                        ></iframe>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto rounded-md object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                No resources uploaded yet for this lesson.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
