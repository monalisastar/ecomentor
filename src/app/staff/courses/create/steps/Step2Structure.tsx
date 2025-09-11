"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Video, FileText, HelpCircle, Menu } from "lucide-react"

// DnD Kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// TipTap
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

type LessonType = "video" | "quiz" | "reading"

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

// ----- SortableItem -----
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

// ----- ModuleCard -----
function ModuleCard({
  module,
  addLesson,
  openLesson,
}: {
  module: Module
  addLesson: (moduleId: string, type: LessonType) => void
  openLesson: (moduleId: string, lesson: Lesson) => void
}) {
  return (
    <Card className="p-4 mb-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center">
          <Menu className="w-4 h-4 mr-2" /> {module.title}
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => addLesson(module.id, "video")}>
            <Video className="w-4 h-4 mr-1" /> Video
          </Button>
          <Button size="sm" onClick={() => addLesson(module.id, "reading")}>
            <FileText className="w-4 h-4 mr-1" /> Reading
          </Button>
          <Button size="sm" onClick={() => addLesson(module.id, "quiz")}>
            <HelpCircle className="w-4 h-4 mr-1" /> Quiz
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {module.lessons.map((lesson) => (
            <SortableItem key={lesson.id} id={lesson.id}>
              <div className="p-2 border rounded flex justify-between items-center bg-muted mb-2">
                <span>{lesson.title}</span>
                <Button size="sm" onClick={() => openLesson(module.id, lesson)}>
                  Edit
                </Button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  )
}

// ----- Step2Structure -----
export default function Step2Structure({
  data,
  setData,
}: {
  data: { modules: Module[] }
  setData: (newData: Partial<{ modules: Module[] }>) => void
}) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))
  const modules = data.modules || []

  const addModule = () => {
    const newModule: Module = { id: Date.now().toString(), title: "New Module", lessons: [] }
    setData({ modules: [...modules, newModule] })
  }

  const addLesson = (moduleId: string, type: LessonType) => {
    const newLesson: Lesson = { id: Date.now().toString(), title: `New ${type} lesson`, type, questions: type === "quiz" ? [] : undefined }
    const newModules = modules.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m))
    setData({ modules: newModules })
  }

  const openLesson = (moduleId: string, lesson: Lesson) => {
    setActiveModuleId(moduleId)
    setActiveLesson(lesson)
  }

  const saveLesson = (lesson: Lesson) => {
    const newModules = modules.map((m) =>
      m.id === activeModuleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) } : m
    )
    setData({ modules: newModules })
    setActiveLesson(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Module reorder
    if (modules.some((m) => m.id === active.id)) {
      setData({ modules: arrayMove(modules, modules.findIndex((m) => m.id === active.id), modules.findIndex((m) => m.id === over.id)) })
      return
    }

    // Lesson reorder / cross-module move
    const sourceModule = modules.find((m) => m.lessons.some((l) => l.id === active.id))
    const targetModule = modules.find((m) => m.lessons.some((l) => l.id === over.id))
    if (!sourceModule || !targetModule) return

    const sourceIndex = sourceModule.lessons.findIndex((l) => l.id === active.id)
    const targetIndex = targetModule.lessons.findIndex((l) => l.id === over.id)
    const lessonToMove = sourceModule.lessons[sourceIndex]

    let newModules = [...modules]
    if (sourceModule.id === targetModule.id) {
      newModules = newModules.map((m) => (m.id === sourceModule.id ? { ...m, lessons: arrayMove(m.lessons, sourceIndex, targetIndex) } : m))
    } else {
      newModules = newModules.map((m) => {
        if (m.id === sourceModule.id) return { ...m, lessons: m.lessons.filter((l) => l.id !== active.id) }
        if (m.id === targetModule.id) {
          const newLessons = [...m.lessons]
          newLessons.splice(targetIndex, 0, lessonToMove)
          return { ...m, lessons: newLessons }
        }
        return m
      })
    }

    setData({ modules: newModules })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Step 2: Structure your course</h2>
      <Button onClick={addModule}>
        <Plus className="w-4 h-4 mr-2" /> Add Module
      </Button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {modules.map((module) => (
            <SortableItem key={module.id} id={module.id}>
              <ModuleCard module={module} addLesson={addLesson} openLesson={openLesson} />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

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
                <Input value={activeLesson.title} onChange={(e) => setActiveLesson({ ...activeLesson, title: e.target.value })} />

                {activeLesson.type === "video" && (
                  <>
                    <Label>Upload Video</Label>
                    <Input type="file" accept="video/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setActiveLesson({ ...activeLesson, videoUrl: URL.createObjectURL(file) })
                    }} />
                    {activeLesson.videoUrl && <video src={activeLesson.videoUrl} controls className="w-full rounded border mt-2" />}
                    <Label>Transcript</Label>
                    <Textarea value={activeLesson.transcript || ""} onChange={(e) => setActiveLesson({ ...activeLesson, transcript: e.target.value })} />
                  </>
                )}

                {activeLesson.type === "reading" && <RichEditor content={activeLesson.content} onChange={(val) => setActiveLesson({ ...activeLesson, content: val })} />}

                {activeLesson.type === "quiz" && (
                  <>
                    <Label>Questions</Label>
                    {(activeLesson.questions || []).map((q, idx) => (
                      <div key={idx} className="space-y-2 border p-2 rounded">
                        <Input placeholder="Question" value={q.q} onChange={(e) => {
                          const updated = [...(activeLesson.questions || [])]
                          updated[idx].q = e.target.value
                          setActiveLesson({ ...activeLesson, questions: updated })
                        }} />
                        <Input placeholder="Answer" value={q.a} onChange={(e) => {
                          const updated = [...(activeLesson.questions || [])]
                          updated[idx].a = e.target.value
                          setActiveLesson({ ...activeLesson, questions: updated })
                        }} />
                      </div>
                    ))}
                    <Button size="sm" onClick={() => setActiveLesson({ ...activeLesson, questions: [...(activeLesson.questions || []), { q: "", a: "" }] })}>Add Question</Button>
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
