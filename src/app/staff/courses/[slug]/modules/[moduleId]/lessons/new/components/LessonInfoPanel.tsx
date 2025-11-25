'use client'

import { useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Bold, Italic, List, XCircle } from 'lucide-react'

interface LessonInfoPanelProps {
  formData: {
    title: string
    description: string
    videoUrl: string | null
    fileUrl: string | null
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      videoUrl: string | null
      fileUrl: string | null
    }>
  >
}

export default function LessonInfoPanel({ formData, setFormData }: LessonInfoPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // 🧠 Keep editor content synced when formData.description updates
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== formData.description) {
      editorRef.current.innerHTML = formData.description
    }
  }, [formData.description])

  // ⚡ Apply toolbar formatting
  const formatText = (command: string) => {
    document.execCommand(command, false)
    saveContent()
  }

  const clearFormatting = () => {
    if (editorRef.current) {
      const textOnly = editorRef.current.innerText
      editorRef.current.innerHTML = textOnly
      saveContent()
    }
  }

  // ✅ Save editor content to state safely
  const saveContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      setFormData((prev) => ({ ...prev, description: html }))
    }
  }

  return (
    <div className="space-y-6">
      {/* 🏷️ Lesson Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Lesson Title</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Understanding Carbon Footprints"
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {/* 📝 Lesson Description (Rich Text Area) */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Lesson Description</label>

        {/* 🧰 Toolbar */}
        <div className="flex items-center gap-2 mb-2 bg-black/30 border border-white/10 rounded-lg p-2 w-fit">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className="text-gray-300 hover:text-green-400 transition"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className="text-gray-300 hover:text-green-400 transition"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('insertUnorderedList')}
            className="text-gray-300 hover:text-green-400 transition"
            title="Bulleted list"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={clearFormatting}
            className="text-gray-300 hover:text-red-400 transition"
            title="Clear formatting"
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* ✏️ Editable Text Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveContent}
          onBlur={saveContent}
          className="min-h-[160px] w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y leading-relaxed prose prose-invert max-w-none"
          style={{
            whiteSpace: 'pre-wrap',
            outline: 'none',
          }}
        />

        <p className="text-sm text-gray-400 mt-2">
          💡 Tip: You can use <strong>bold</strong>, <em>italic</em>, or bullet lists to make your
          description more engaging.
        </p>
      </div>
    </div>
  )
}
