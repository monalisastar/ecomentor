'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, LayoutDashboard, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CourseForm from '../../components/CourseForm'
import { toast } from 'sonner'

export default function EditCoursePage() {
  const router = useRouter()
  const { slug } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 🧠 Fetch existing course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`)
        if (!res.ok) throw new Error('Failed to fetch course details')
        const data = await res.json()
        setCourse(data)
      } catch (err: any) {
        toast.error(err.message || 'Error loading course data')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchCourse()
  }, [slug])

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 pt-[88px] flex flex-col items-center justify-start">
      {/* 🔹 Overlay with soft blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />

      {/* 🔙 Back Button */}
      <div className="z-10 w-full max-w-6xl flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/staff/courses')}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>
      </div>

      {/* 🧱 Glassmorphic Card */}
      <section className="relative z-10 w-full max-w-6xl p-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-white">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400 drop-shadow-md">
          Edit Course
        </h1>
        <p className="text-gray-200/80 mb-8 text-sm sm:text-base">
          Review or update the course information below.  
          If you’re already satisfied with how it looks, you can skip editing and go straight to the  
          <span className="text-green-300 font-semibold"> Course Editor </span>  
          to structure modules, lessons, and uploads.
        </p>

        {/* 🌀 Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-white/70" size={32} />
            <p className="text-gray-300 mt-4">Loading course details...</p>
          </div>
        ) : course ? (
          <>
            <div className="text-gray-100/80">
              <CourseForm
                mode="edit"
                slug={slug as string}
                initialData={course}
                onSuccess={() => {
                  toast.success('✅ Course updated successfully!')
                }}
              />
            </div>

            {/* 🔗 Course Editor Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-10 gap-4 flex-wrap">
              <p className="text-gray-200/70 text-sm text-center sm:text-left">
                Finished reviewing this course?
              </p>

              {/* ✅ Go to Editor */}
              <Button
                onClick={() => router.push(`/staff/courses/${slug}`)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <LayoutDashboard size={18} />
                Open Course Editor
              </Button>

              {/* 🚀 Skip Editing Option */}
              <Button
                variant="outline"
                onClick={() => router.push(`/staff/courses/${slug}`)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-all"
              >
                <SkipForward size={16} />
                Skip & Go to Editor
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-red-400 font-medium py-20">
            ❌ Failed to load course. Please try again later.
          </p>
        )}
      </section>
    </main>
  )
}
