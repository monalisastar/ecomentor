'use client'

import { useState } from 'react'
import { FileText, User, Link as LinkIcon, Download } from 'lucide-react'

interface CourseTabsProps {
  about: string
  instructor: {
    name: string
    bio: string
    avatar?: string
  }
  resources?: { title: string; url: string }[]
}

export default function CourseTabs({ about, instructor, resources = [] }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'instructor' | 'resources'>('about')
  const [downloading, setDownloading] = useState(false)

  const tabs = [
    { key: 'about', label: 'About this Lesson', icon: <FileText size={16} /> },
    { key: 'instructor', label: 'Instructor', icon: <User size={16} /> },
    { key: 'resources', label: 'Resources', icon: <LinkIcon size={16} /> },
  ]

  // 🧩 Handle downloading all resources (simple browser method)
  const handleDownloadAll = async () => {
    if (!resources.length) return
    setDownloading(true)

    try {
      for (const res of resources) {
        const link = document.createElement('a')
        link.href = res.url
        link.download = res.title || 'resource'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Failed to download resources:', err)
      alert('Some resources could not be downloaded automatically.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 🧭 Tabs Header */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
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
        {/* About Section */}
        {activeTab === 'about' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lesson Overview</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {about?.trim() || 'No description available for this lesson.'}
            </p>
          </div>
        )}

        {/* Instructor Section */}
        {activeTab === 'instructor' && (
          <div className="flex items-start gap-4">
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
          </div>
        )}

        {/* Resources Section */}
        {activeTab === 'resources' && (
          <div>
            {resources.length > 0 ? (
              <>
                <ul className="space-y-3 mb-6">
                  {resources.map((res, i) => (
                    <li key={i}>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                      >
                        <LinkIcon size={14} />
                        {res.title}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* 🟩 Download All Button */}
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloading ? 'Downloading...' : 'Download All Resources'}
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No additional resources available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
