'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import Step1CoreInfo from "./steps/Step1CoreInfo"
import Step2Structure from "./steps/Step2Structure"
import Step3Lessons from "./steps/Step3Lessons"
import Step4Engagement from "./steps/Step4Engagement"
import Step5Assessment from "./steps/Step5Assessment"
import Step6Review from "./steps/Step6Review"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, LayoutDashboard } from "lucide-react"

import { createCourse } from "@/services/api/courses"

// ----- Types -----
export type LessonType = "video" | "quiz" | "reading"

export type Lesson = {
  id: string
  title: string
  type: LessonType
  content?: string
  questions?: { q: string; a: string }[]
  videoUrl?: string
  transcript?: string
}

export type Module = {
  id: string
  title: string
  lessons: Lesson[]
}

export type CourseData = {
  title: string
  description: string
  category: string
  level: string
  modules: Module[]
  settings: Record<string, any>
  assessments: any[]
}

// ----- Steps -----
const steps = [
  { id: 1, label: "Core Info", component: Step1CoreInfo },
  { id: 2, label: "Structure", component: Step2Structure },
  { id: 3, label: "Lessons", component: Step3Lessons },
  { id: 4, label: "Engagement", component: Step4Engagement },
  { id: 5, label: "Assessment", component: Step5Assessment },
  { id: 6, label: "Review & Publish", component: Step6Review },
]

export function CourseBuilder() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    category: "",
    level: "",
    modules: [],
    settings: {},
    assessments: [],
  })

  const CurrentStep = steps[step].component

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))
  const jumpToStep = (i: number) => setStep(i)

  // --- API Publish Handler ---
  const publishCourse = async () => {
    try {
      setLoading(true)
      const data = await createCourse(courseData)
      toast.success("Course published successfully 🚀")
      console.log("Published:", data)
      window.location.href = "/staff/courses"
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong while publishing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-900 via-sky-900 to-black text-white relative overflow-hidden p-6 grid grid-cols-4 gap-6">
      {/* ----- Sidebar Progress ----- */}
      <div className="col-span-1 space-y-4">
        <h3 className="text-lg font-bold mb-2">Course Progress</h3>
        {steps.map((s, i) => (
          <Button
            key={s.id}
            size="sm"
            variant={i === step ? "default" : "outline"}
            className="w-full justify-start gap-2"
            onClick={() => jumpToStep(i)}
          >
            {i < step ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4" />}
            {s.label}
          </Button>
        ))}
      </div>

      {/* ----- Main Step Area ----- */}
      <div className="col-span-3">
        <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStep data={courseData} setData={setCourseData} />
            </motion.div>
          </AnimatePresence>

          {/* Step Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 0}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Back
            </Button>

            <div className="flex gap-3">
              <Link href="/staff/courses">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </Link>

              {step === steps.length - 1 ? (
                <Button
                  onClick={publishCourse}
                  disabled={loading}
                  className="bg-teal-500/70 hover:bg-teal-400 text-white rounded-xl shadow-lg"
                >
                  {loading ? "Publishing..." : "Publish Course 🚀"}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-teal-500/70 hover:bg-teal-400 text-white rounded-xl shadow-lg"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
