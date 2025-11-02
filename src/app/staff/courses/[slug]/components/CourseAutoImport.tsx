'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, FileUp, Eye, Database, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload'

export default function CourseAutoImport({
  slug,
  onImportComplete,
  context = 'course-import',
}: {
  slug: string
  onImportComplete: () => Promise<void> | void
  context?: string
}) {
  const { uploadFile, progress, error } = useSupabaseUpload()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploadedFile, setUploadedFile] = useState<{ path: string; bucket: string } | null>(null)

  // 🔄 Drop handler
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) return toast.error('⚠️ File too large (max 50 MB)')
    if (!confirm(`Upload and auto-import “${file.name}”?`)) return

    try {
      setUploading(true)
      toast.info('📤 Uploading to Supabase…')

      const uploadResult = await uploadFile(file, context)
      if (!uploadResult.success) throw new Error(uploadResult.error || 'Upload failed')

      setUploadedFile({ path: uploadResult.path, bucket: uploadResult.bucket })
      toast.info('🧠 Parsing course structure…')

      // 📬 Backend preview import
      const res = await fetch(`/api/staff/courses/${slug}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: uploadResult.path,
          bucket: uploadResult.bucket,
          preview: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      setPreviewData(data.preview || [])
      toast.success('✅ File parsed successfully — preview ready!')
      await onImportComplete()
    } catch (err: any) {
      console.error(err)
      toast.error(`❌ ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // 💾 Save to DB
  const handleSaveToDatabase = async () => {
    if (!uploadedFile) return toast.error('⚠️ No uploaded file found. Please upload again.')

    try {
      setSaving(true)
      toast.info('💾 Saving to database…')

      const res = await fetch(`/api/staff/courses/${slug}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: uploadedFile.path,
          bucket: uploadedFile.bucket,
          preview: false,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      toast.success(data.message || '✅ Course modules and lessons saved!')
      setPreviewData([])
      await onImportComplete()
    } catch (err: any) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 🧠 Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  return (
    <section className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      {saving && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
          <Loader2 size={28} className="animate-spin text-green-700 mb-2" />
          <p className="text-gray-700 font-medium">Saving course to database...</p>
        </div>
      )}

      <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
        <Upload size={18} className="text-green-600" /> Auto-Import Course
      </h2>
      <p className="text-sm text-gray-600">
        Drag or select a <b>.pptx</b>, <b>.pdf</b>, <b>.docx</b>, or <b>.zip</b> file to auto-generate modules and lessons.
      </p>

      {/* 🧩 Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Uploading...
          </p>
        ) : (
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <FileUp size={16} /> Drop file here or click to browse
          </p>
        )}
      </div>

      {/* Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {/* ✅ Upload Complete */}
      {uploadedFile && !uploading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
          <CheckCircle size={16} /> Uploaded successfully to {uploadedFile.bucket}
        </div>
      )}

      {/* 👁️ Preview */}
      {previewData.length > 0 && (
        <div className="mt-4 border-t pt-3 space-y-3">
          <h3 className="text-md font-semibold flex items-center gap-2">
            <Eye size={16} className="text-green-600" /> Parsed Structure Preview
          </h3>

          <ul className="pl-4 mt-2 text-sm text-gray-700 space-y-2">
            {previewData.map((module, i) => (
              <li key={i} className="border-l-2 border-green-400 pl-2">
                <b>{module.title}</b>
                <ul className="pl-5 list-disc text-gray-600">
                  {module.lessons?.map((lesson: any, j: number) => (
                    <li key={j}>{lesson.title}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="pt-3">
            <button
              onClick={handleSaveToDatabase}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Database size={16} /> Save to Database
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
