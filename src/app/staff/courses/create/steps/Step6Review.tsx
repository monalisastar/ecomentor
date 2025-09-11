"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { toast } from "react-hot-toast"
import { FileText, Eye, Download, Sparkles } from "lucide-react"

// dynamic import jsPDF for client-only usage
const jsPDF = dynamic(() => import("jspdf").then((m) => m.jsPDF), { ssr: false })

type Lesson = {
  id: string
  title: string
  type: "video" | "reading" | "quiz" | "assignment" | "discussion" | string
  duration?: string
  details?: any
}

type Module = {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

type Assessment = {
  id: string
  title?: string
  timeLimit?: string
  passMark?: number
  questions?: any[]
}

type EngagementSettings = {
  mode?: "self-paced" | "sequential" | "drip"
  dripIntervalDays?: number
  prerequisites?: string[]
  gamification?: { badges?: boolean; points?: boolean }
}

type CourseData = {
  id?: string
  title?: string
  shortDescription?: string
  fullDescription?: string
  category?: string
  level?: string
  thumbnailUrl?: string
  tags?: string[]
  modules?: Module[]
  assessments?: Assessment[]
  engagement?: EngagementSettings
}

export default function Step6Review({
  course,
  onEditStep,
  onPublish,
  onSaveDraft,
}: {
  course?: CourseData
  onEditStep?: (stepIndex: number) => void
  onPublish?: (course: CourseData) => Promise<void>
  onSaveDraft?: (course: CourseData) => Promise<void>
}) {
  // Early guard
  if (!course) {
    return <div className="p-6 text-gray-500">No course data available yet.</div>
  }

  const [previewMode, setPreviewMode] = useState<"lecturer" | "student">("lecturer")
  const [suggestions, setSuggestions] = useState<{ level: "good" | "warn" | "error"; text: string }[]>([])
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    runHeuristics()
  }, [course])

  function runHeuristics() {
    const s: { level: "good" | "warn" | "error"; text: string }[] = []

    if (!course.title || course.title.trim().length < 5) {
      s.push({ level: "error", text: "Course title is too short — choose a descriptive title." })
    } else {
      s.push({ level: "good", text: "Title looks good." })
    }

    if (!course.thumbnailUrl) {
      s.push({ level: "warn", text: "No thumbnail — consider uploading a clear course cover image." })
    } else {
      s.push({ level: "good", text: "Thumbnail present." })
    }

    const moduleCount = course.modules?.length || 0
    if (moduleCount === 0) {
      s.push({ level: "error", text: "No modules found — add at least one module." })
    } else {
      s.push({ level: "good", text: `${moduleCount} module(s) configured.` })
    }

    course.modules?.forEach((m, i) => {
      if ((m.lessons?.length || 0) > 7) {
        s.push({
          level: "warn",
          text: `Module ${i + 1} (“${m.title || "Untitled"}”) has ${m.lessons?.length} lessons — consider splitting into two modules.`,
        })
      }
    })

    const firstTwo = course.modules?.slice(0, 2) || []
    const earlyQuiz = firstTwo.some((m) => m.lessons?.some((l) => l.type === "quiz"))
    if (!earlyQuiz) {
      s.push({ level: "warn", text: "No quizzes in the first two modules — consider adding quick checks early." })
    } else {
      s.push({ level: "good", text: "Quizzes present in early modules." })
    }

    if (!course.assessments || course.assessments.length === 0) {
      s.push({ level: "warn", text: "No course-level assessments found — add a final exam/capstone." })
    } else {
      s.push({ level: "good", text: `${course.assessments?.length || 0} assessment(s) configured.` })
    }

    if (course.engagement?.mode === "drip" && !course.engagement?.dripIntervalDays) {
      s.push({ level: "warn", text: "Drip release enabled but interval not set." })
    }

    setSuggestions(s)
  }

  async function exportPdf() {
    setExportingPdf(true)
    try {
      const JS = await jsPDF()
      const doc = new JS()
      const margin = 18
      let y = 20

      doc.setFontSize(18)
      doc.text(course.title || "Untitled Course", margin, y)
      y += 8
      doc.setFontSize(11)
      doc.text(`Category: ${course.category || "—"}  •  Level: ${course.level || "—"}`, margin, y)
      y += 8
      if (course.tags && course.tags.length) {
        doc.text(`Tags: ${course.tags.join(", ")}`, margin, y)
        y += 8
      }

      doc.setFontSize(12)
      doc.text("Short Description:", margin, y)
      y += 6
      const shortDesc = course.shortDescription || ""
      const split = doc.splitTextToSize(shortDesc, 180)
      doc.text(split, margin, y)
      y += split.length * 6 + 6

      doc.setFontSize(13)
      doc.text("Course Outline", margin, y)
      y += 8

      course.modules?.forEach((m, mi) => {
        doc.setFontSize(12)
        doc.text(`${mi + 1}. ${m.title || "Untitled Module"}`, margin, y)
        y += 7
        if (m.description) {
          const md = doc.splitTextToSize(m.description, 170)
          doc.setFontSize(10)
          doc.text(md, margin + 6, y)
          y += md.length * 6 + 4
        }
        m.lessons?.forEach((l, li) => {
          doc.setFontSize(10)
          const line = `- ${l.title || "Untitled Lesson"} [${l.type}${l.duration ? ` • ${l.duration}` : ""}]`
          const lines = doc.splitTextToSize(line, 170)
          doc.text(lines, margin + 8, y)
          y += lines.length * 6
          if (y > 270) {
            doc.addPage()
            y = 20
          }
        })
        y += 6
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      })

      doc.setFontSize(9)
      doc.text(`Generated ${new Date().toLocaleString()}`, margin, 285)

      doc.save(`${(course.title || "course").replace(/\s+/g, "_")}_outline.pdf`)
      toast.success("PDF exported")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  async function handlePublishCourse() {
    if (!onPublish) return toast.error("Publish callback not provided")
    try {
      await onPublish(course)
      toast.success("Course published")
    } catch (err) {
      console.error(err)
      toast.error("Publish failed")
    }
  }

  async function handleSaveDraft() {
    if (!onSaveDraft) return toast.error("Save draft callback not provided")
    try {
      await onSaveDraft(course)
      toast.success("Draft saved")
    } catch (err) {
      console.error(err)
      toast.error("Save failed")
    }
  }

  function suggestionBadge(level: "good" | "warn" | "error") {
    if (level === "good") return <Badge className="bg-emerald-100 text-emerald-700">Good</Badge>
    if (level === "warn") return <Badge className="bg-yellow-100 text-yellow-800">Suggestion</Badge>
    return <Badge className="bg-red-100 text-red-700">Issue</Badge>
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: main review */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <CardTitle className="text-xl">{course.title || "Untitled Course"}</CardTitle>
                <div className="text-sm text-gray-600">{course.shortDescription || "No short description"}</div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={previewMode === "student"}
                    onCheckedChange={(val) => setPreviewMode(val ? "student" : "lecturer")}
                  />
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <div className="text-sm">{previewMode === "student" ? "Student View" : "Lecturer View"}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
                  <Button className="bg-sky-600 hover:bg-sky-700" onClick={handlePublishCourse}>Publish Course</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Modules & Lessons */}
              <div className="space-y-4">
                {course.modules?.length ? (
                  <Accordion type="single" collapsible>
                    {course.modules.map((m, mi) => (
                      <AccordionItem key={m.id || mi} value={m.id || `module-${mi}`}>
                        <AccordionTrigger>
                          <div className="flex justify-between w-full">
                            <div>
                              {mi + 1}. {m.title || "Untitled Module"}
                              <div className="text-xs text-gray-500">{m.description || ""}</div>
                            </div>
                            <div className="text-sm text-gray-600">{m.lessons?.length || 0} lessons</div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {m.lessons?.map((l, li) => (
                              <div key={l.id || li} className={`p-3 rounded-md ${previewMode === "student" ? "bg-white" : "bg-gray-50"} flex justify-between items-center`}>
                                <div>
                                  <div className="font-medium">{li + 1}. {l.title || "Untitled Lesson"}</div>
                                  <div className="text-xs text-gray-500">{l.type}{l.duration ? ` • ${l.duration}` : ""}</div>
                                </div>
                                <div className="text-xs text-gray-500">{previewMode === "student" ? "Preview" : "Details"}</div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-sm text-gray-500">No modules configured yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI suggestions & actions */}
        <aside className="w-full md:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-sky-600" /> AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.length ? suggestions.map((sugg, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {suggestionBadge(sugg.level)}
                    <div className="text-sm text-gray-700">{sugg.text}</div>
                  </div>
                )) : <div className="text-sm text-gray-500">No suggestions available.</div>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast("AI suggestions refreshed (heuristic)")}>Refresh</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1,2,3,4,5].map((step) => (
                <Button key={step} variant="outline" onClick={() => onEditStep?.(step)}>Edit Step {step}</Button>
              ))}
              <div className="mt-2 flex gap-2">
                <Button onClick={exportPdf} disabled={exportingPdf}>
                  <Download className="w-4 h-4 mr-2" /> {exportingPdf ? "Exporting..." : "Export Outline (PDF)"}
                </Button>
                <Button onClick={() => toast("Preview link copied (placeholder)")}>
                  <FileText className="w-4 h-4 mr-2" /> Copy Preview Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
