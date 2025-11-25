'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import CourseOverview from './components/CourseOverview'
import ModuleList from './components/ModuleList'
import ModuleAddModal from './components/ModuleAddModal'
import CoursePublishButton from './components/CoursePublishButton'

export default function CourseEditorPage() {
  const { slug } = useParams()
  const router = useRouter()

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // ✅ Fetch course details and modules
  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/courses?slug=${slug}`)
      if (!res.ok) throw new Error('Failed to fetch course details')

      const data = await res.json()
      setCourse(data)
      setModules(data.modules || [])
    } catch (error: any) {
      console.error('Error loading course:', error)
      toast.error(error.message || 'Error loading course.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) fetchCourseData()
  }, [slug])

  const handleModuleCreated = async () => {
    await fetchCourseData()
    toast.success('Module added successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
        <Loader2 size={40} className="animate-spin text-white/70" />
      </div>
    )
  }

  if (!course) {
    return (
      <main className="flex flex-col items-center justify-center h-screen bg-[#0f2027] text-white">
        <p className="text-gray-300 text-lg">Course not found.</p>
        <Button
          onClick={() => router.push('/staff/courses')}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Back to Courses
        </Button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 pt-[88px] text-white relative">
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Header Section */}
      <div className="relative z-10 max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            {course.title}
          </h1>
          <p className="text-gray-300">{course.description}</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all"
          >
            <PlusCircle size={18} />
            Add Module
          </Button>

          {/* ✅ Publish Course Button */}
          <CoursePublishButton
            courseSlug={slug as string}
            isPublished={course.published}
          />
        </div>
      </div>

      {/* Course Overview */}
      <div className="relative z-10 max-w-6xl mx-auto mb-10">
        <CourseOverview
          slug={slug as string}
          title={course.title}
          description={course.description}
          category={course.category}
          published={course.published}
          onSave={fetchCourseData}
        />
      </div>

      {/* Module List */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <ModuleList
          courseSlug={slug as string}
          modules={modules}
          onRefreshModules={fetchCourseData}
        />
      </div>

      {/* Add Module Modal */}
      <ModuleAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        courseSlug={slug as string}
        onModuleCreated={handleModuleCreated}
      />
    </main>
  )
}
