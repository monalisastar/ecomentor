"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

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

// ----- RichEditor -----
function RichEditor({ content, onChange }: { content?: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })
  return <EditorContent editor={editor} className="ProseMirror border rounded p-2 min-h-[150px]" />
}

// ----- LessonCard -----
function LessonCard({
  moduleId,
  lesson,
  onEdit,
}: {
  moduleId: string
  lesson: Lesson
  onEdit: (moduleId: string, lesson: Lesson) => void
}) {
  return (
    <div className="border p-2 rounded flex justify-between items-center bg-muted mb-2">
      <span>
        {lesson.title} ({lesson.type})
      </span>
      <Button size="sm" onClick={() => onEdit(moduleId, lesson)}>
        Edit
      </Button>
    </div>
  )
}

// ----- Step3Lessons -----
export default function Step3Lessons({
  data,
  setData,
}: {
  data: { modules: Module[] }
  setData: (newData: Partial<{ modules: Module[] }>) => void
}) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  const openLesson = (moduleId: string, lesson: Lesson) => {
    setActiveModuleId(moduleId)
    setActiveLesson(lesson)
  }

  const saveLesson = (lesson: Lesson) => {
    if (!activeModuleId) return
    const updatedModules = data.modules.map((m) =>
      m.id === activeModuleId
        ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) }
        : m
    )
    setData({ modules: updatedModules })
    setActiveLesson(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Step 3: Lesson Content & Resources</h2>

      {data.modules.map((module) => (
        <Card key={module.id} className="p-4">
          <CardHeader>
            <CardTitle>{module.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {module.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                moduleId={module.id}
                lesson={lesson}
                onEdit={openLesson}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Lesson Modal */}
      <Dialog open={!!activeLesson} onOpenChange={() => setActiveLesson(null)}>
        <DialogContent className="max-w-2xl">
          {activeLesson && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {activeLesson.type} Lesson</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label>Lesson Title</Label>
                <Input
                  value={activeLesson.title}
                  onChange={(e) => setActiveLesson({ ...activeLesson, title: e.target.value })}
                />

                {activeLesson.type === "video" && (
                  <>
                    <Label>Upload Video</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setActiveLesson({ ...activeLesson, videoUrl: URL.createObjectURL(file) })
                      }}
                    />
                    {activeLesson.videoUrl && (
                      <video src={activeLesson.videoUrl} controls className="w-full rounded border mt-2" />
                    )}
                    <Label>Transcript</Label>
                    <Textarea
                      value={activeLesson.transcript || ""}
                      onChange={(e) => setActiveLesson({ ...activeLesson, transcript: e.target.value })}
                    />
                  </>
                )}

                {activeLesson.type === "reading" && (
                  <RichEditor content={activeLesson.content} onChange={(val) => setActiveLesson({ ...activeLesson, content: val })} />
                )}

                {activeLesson.type === "quiz" && (
                  <>
                    <Label>Questions</Label>
                    {(activeLesson.questions || []).map((q, idx) => (
                      <div key={idx} className="space-y-2 border p-2 rounded">
                        <Input
                          placeholder="Question"
                          value={q.q}
                          onChange={(e) => {
                            const updated = [...(activeLesson.questions || [])]
                            updated[idx].q = e.target.value
                            setActiveLesson({ ...activeLesson, questions: updated })
                          }}
                        />
                        <Input
                          placeholder="Answer"
                          value={q.a}
                          onChange={(e) => {
                            const updated = [...(activeLesson.questions || [])]
                            updated[idx].a = e.target.value
                            setActiveLesson({ ...activeLesson, questions: updated })
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={() =>
                        setActiveLesson({
                          ...activeLesson,
                          questions: [...(activeLesson.questions || []), { q: "", a: "" }],
                        })
                      }
                    >
                      Add Question
                    </Button>
                  </>
                )}

                <Button onClick={() => saveLesson(activeLesson)}>Save</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
