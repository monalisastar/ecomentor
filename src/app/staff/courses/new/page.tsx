'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CourseForm from '../components/CourseForm'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function NewCoursePage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  // 🎉 Trigger success animation and redirect
  const handleSuccess = () => {
    setShowSuccess(true)
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ffb3', '#fff176', '#00e676'],
    })

    setTimeout(() => {
      setShowSuccess(false)
      router.push('/staff/courses')
    }, 2500)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 pt-[88px] flex flex-col items-center justify-start">
      {/* 🔹 Ambient glow and blur */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(46,204,113,0.1),transparent_60%)] blur-3xl" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />

      {/* 🔙 Back Button */}
      <div className="z-20 w-full max-w-6xl flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/staff/courses')}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:scale-[1.02] transition-all"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>
      </div>

      {/* 🧱 Glassmorphic Card */}
      <section className="relative z-10 w-full max-w-6xl p-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-white transition-all hover:shadow-[0_12px_50px_rgba(0,0,0,0.45)]">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-yellow-200 to-emerald-400 drop-shadow-md">
          Create New Course
        </h1>

        <div className="text-gray-100/90">
          <CourseForm mode="create" onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ✅ Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center p-10 bg-white/10 border border-white/30 rounded-2xl backdrop-blur-xl shadow-2xl text-white"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-semibold text-white/90">
                Course Created Successfully!
              </h2>
              <p className="text-white/70 mt-2 text-sm">
                Redirecting back to Course List...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0f2027] via-transparent to-transparent pointer-events-none" />
    </main>
  )
}
