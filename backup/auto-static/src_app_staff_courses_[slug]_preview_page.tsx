'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  FileArchive,
  Loader2,
  X,
  Search,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

type Lesson = {
  id: string
  title: string
  duration: string
  videoUrl?: string
  documentUrl?: string
  resourceUrl?: string
  description?: string
  fileType?: 'video' | 'pdf' | 'resource'
}

type Module = {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export default function CoursePreviewPage() {
  const { slug } = useParams()
  const router = useRouter()

  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  // search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf' | 'resource'>('all')

  const closeViewer = () => setActiveLesson(null)

  // 🧠 Fetch course with modules and lessons
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        const id =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('id') || slug
            : slug

        const course = await apiRequest(`/courses/${id}`, 'GET')
        if (!course) throw new Error('Course not found.')
        setModules(course.modules || [])
      } catch (err: any) {
        console.error('Error fetching course preview:', err)
        setError('Failed to load course preview.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [slug])

  // 🎯 Filter lessons based on search and type
  const filteredModules = useMemo(() => {
    return modules.map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => {
        const fileType =
          lesson.videoUrl
            ? 'video'
            : lesson.documentUrl
            ? 'pdf'
            : lesson.resourceUrl
            ? 'resource'
            : 'resource'

        const matchesType = filterType === 'all' || fileType === filterType
        const matchesSearch = lesson.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        return matchesType && matchesSearch
      }),
    }))
  }, [modules, searchTerm, filterType])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <Loader2 size={32} className="animate-spin mb-3 text-green-600" />
        <p>Loading course preview...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Retry
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-green-700 transition flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            Preview — {slug?.toString().replace('-', ' ')}
          </h1>
        </div>
      </div>

      {/* Course Overview */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Course Overview
        </h2>
        <p className="text-gray-600 max-w-3xl">
          Review your course structure and preview all videos, PDFs, and resources before publishing.
        </p>
      </section>

      {/* 🔍 Search + Filter Bar */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search lessons by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600"
          >
            <option value="all">All Files</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="resource">Resources</option>
          </select>
        </div>
      </section>

      {/* Modules and Lessons */}
      <section className="space-y-6">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <div
              key={module.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Module Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
              </div>

              {/* Lessons */}
              <div className="p-6 space-y-4">
                {module.lessons.length > 0 ? (
                  module.lessons.map((lesson) => {
                    const fileType =
                      lesson.videoUrl
                        ? 'video'
                        : lesson.documentUrl
                        ? 'pdf'
                        : lesson.resourceUrl
                        ? 'resource'
                        : 'resource'

                    const icon =
                      fileType === 'pdf' ? (
                        <FileText size={18} className="text-red-600" />
                      ) : fileType === 'resource' ? (
                        <FileArchive size={18} className="text-yellow-600" />
                      ) : (
                        <PlayCircle size={18} className="text-green-600" />
                      )

                    return (
                      <motion.div
                        key={lesson.id}
                        onClick={() => setActiveLesson({ ...lesson, fileType })}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-full p-2">{icon}</div>
                          <div>
                            <p className="font-medium text-gray-900">{lesson.title}</p>
                            <p className="text-xs text-gray-500">
                              Duration: {lesson.duration}
                            </p>
                            <span className="inline-block mt-1 text-[10px] uppercase bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                              {fileType}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-green-700 font-medium">
                          Click to View
                        </p>
                      </motion.div>
                    )
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No lessons match your filters.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No modules available yet.
          </p>
        )}
      </section>

      {/* Footer */}
      <div className="flex justify-end pt-8 border-t border-gray-200">
        <button
          onClick={() => router.push(`/staff/courses/${slug}`)}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Editor
        </button>
      </div>

      {/* 📺 Lesson Viewer Modal */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                onClick={closeViewer}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                <X size={22} />
              </button>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {activeLesson.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Duration: {activeLesson.duration}
                </p>

                {activeLesson.fileType === 'video' && activeLesson.videoUrl && (
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                  />
                )}

                {activeLesson.fileType === 'pdf' && activeLesson.documentUrl && (
                  <iframe
                    src={activeLesson.documentUrl}
                    className="w-full h-[80vh] border border-gray-200 rounded-lg"
                    title={activeLesson.title}
                  />
                )}

                {activeLesson.fileType === 'resource' &&
                  activeLesson.resourceUrl && (
                    <div className="flex flex-col items-center justify-center py-10">
                      <FileArchive size={48} className="text-yellow-600 mb-3" />
                      <p className="text-gray-700 mb-2">
                        This is a downloadable resource.
                      </p>
                      <Link
                        href={activeLesson.resourceUrl}
                        download
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Download Resource
                      </Link>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
