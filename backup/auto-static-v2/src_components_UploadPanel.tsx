'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  UploadCloud,
  AlertCircle,
  FileUp,
  Image as ImageIcon,
  Video,
} from 'lucide-react'
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload'
import { toast } from 'sonner'

type UploadedFile = { url: string; path: string; bucket: string }

type UploadPanelProps = {
  fixedContext?: string
  onUploaded?: (files: UploadedFile[]) => void
  initialUrls?: string[] | null
  fileType?: 'image' | 'document' | 'video'
  multiple?: boolean
}

export default function UploadPanel({
  fixedContext = 'lessons',
  onUploaded,
  initialUrls = null,
  fileType = 'image',
  multiple = false,
}: UploadPanelProps) {
  const { uploadFile } = useSupabaseUpload()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialUrls || [])
  const [error, setError] = useState<string | null>(null)

  // ✅ Validate selected files
  const validateAndSetFiles = (selected: File[]) => {
    const valid: File[] = []
    const invalid: string[] = []

    selected.forEach((f) => {
      const isAllowed =
        fileType === 'image'
          ? f.type.startsWith('image/')
          : fileType === 'video'
          ? f.type.startsWith('video/')
          : [
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/zip',
            ].includes(f.type)

      if (isAllowed) valid.push(f)
      else invalid.push(f.name)
    })

    if (invalid.length > 0) toast.error(`⚠️ Invalid file(s): ${invalid.join(', ')}`)
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid])
      if (fileType === 'image' || fileType === 'video') {
        setPreviewUrls((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))])
      }
      toast.success(`✅ Added ${valid.length} file(s)`)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    validateAndSetFiles(acceptedFiles)
  }, [])

  // ✅ Correct dropzone setup
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple,
    noClick: true,
    noKeyboard: true, // important for open()
  })

  // ✅ Upload handler
  const handleUpload = async () => {
    if (files.length === 0) return toast.error('Select or drop at least one file!')
    setUploading(true)
    setError(null)
    toast.info(`📤 Uploading ${files.length} file(s)...`)

    const uploadedFiles: UploadedFile[] = []
    try {
      for (const file of files) {
        const res = await uploadFile(file, fixedContext)
        if (!res.success) throw new Error(res.error || 'Upload failed')

        uploadedFiles.push({
          url: res.url,
          path: (res as any).path ?? '',
          bucket: 'eco-mentor-assets',
        })

        setProgressMap((prev) => ({ ...prev, [file.name]: 100 }))
      }

      toast.success(`✅ Uploaded ${uploadedFiles.length} file(s) successfully!`)
      onUploaded?.(uploadedFiles)
      if (fileType === 'image' || fileType === 'video') {
        setPreviewUrls(uploadedFiles.map((f) => f.url))
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed.')
      setError(err.message)
    } finally {
      setUploading(false)
      setFiles([])
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-md mx-auto relative z-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        {fileType === 'image' && <><ImageIcon className="w-5 h-5 text-green-600" /> Upload Images</>}
        {fileType === 'video' && <><Video className="w-5 h-5 text-green-600" /> Upload Videos</>}
        {fileType === 'document' && <><FileUp className="w-5 h-5 text-green-600" /> Upload Files</>}
      </h3>

      {/* 🖼️ Preview */}
      {(fileType === 'image' || fileType === 'video') && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative w-full h-24 rounded-lg overflow-hidden border">
              {fileType === 'image' ? (
                <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
              ) : (
                <video src={url} className="w-full h-full object-cover" controls />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 📂 Dropzone */}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg mb-4 transition ${
          isDragActive
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 mb-2 text-gray-500" />
        <p className="text-sm text-gray-600 text-center">
          {isDragActive
            ? 'Drop your file(s) here...'
            : multiple
            ? 'Drag & drop multiple files, or click below to select'
            : 'Drag & drop a file, or click below to select'}
        </p>
        <button
          onClick={(e) => {
            e.preventDefault()
            open() // ✅ now reliably opens native file picker
          }}
          type="button"
          className="mt-3 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-all"
        >
          Browse Files
        </button>
      </div>

      {/* Upload button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition ${
            uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Progress */}
      {Object.entries(progressMap).map(([name, pct]) => (
        <div key={name} className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
          />
        </div>
      ))}

      {/* Error */}
      {error && (
        <motion.div
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="text-red-600" />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  )
}
