'use client'

import { toast } from 'sonner'
import { Video, FileText } from 'lucide-react'
import UploadPanel from '@/components/UploadPanel'

interface LessonResourcesPanelProps {
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

export default function LessonResourcesPanel({
  formData,
  setFormData,
}: LessonResourcesPanelProps) {
  return (
    <div className="space-y-8">
      {/* 🎥 Upload Lesson Video */}
      <div>
        <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
          <Video size={16} className="text-yellow-300" />
          Upload Lesson Video
        </label>

        <UploadPanel
          fixedContext="lesson-videos"
          onUploaded={(url) => {
            if (typeof url === 'string') {
              setFormData((prev) => ({ ...prev, videoUrl: url }))
              toast.success('🎥 Video uploaded successfully!')
            }
          }}
        />

        {formData.videoUrl && (
          <p className="text-xs text-green-400 mt-2 truncate">
            {formData.videoUrl}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          💡 Tip: You can upload an MP4 or WebM file. Recommended max size: 200MB.
        </p>
      </div>

      {/* 📄 Upload Lesson Document */}
      <div>
        <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
          <FileText size={16} className="text-blue-300" />
          Upload Lesson Document (PDF, DOCX, PPTX, etc.)
        </label>

        <UploadPanel
          fixedContext="lesson-documents"
          onUploaded={(url) => {
            if (typeof url === 'string') {
              setFormData((prev) => ({ ...prev, fileUrl: url }))
              toast.success('📄 Document uploaded successfully!')
            }
          }}
        />

        {formData.fileUrl && (
          <p className="text-xs text-green-400 mt-2 truncate">
            {formData.fileUrl}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          📘 You can upload course notes, slides, or reference materials.
        </p>
      </div>
    </div>
  )
}
