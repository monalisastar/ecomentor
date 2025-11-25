'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

      {/* 📝 Lesson Description */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Briefly describe what this lesson covers..."
          rows={5}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <p className="text-sm text-gray-400">
        💡 Tip: Keep your title concise and make the description engaging. This helps learners
        understand what they’ll gain from this lesson.
      </p>
    </div>
  )
}
