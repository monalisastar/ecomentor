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
  FileText,
  RefreshCw,
  Trash2,
  Download,
  Info,
} from 'lucide-react'
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export type UploadedFile = {
  file: File
  url: string
  path: string
  bucket: string
}

interface UploadPanelProps {
  fixedContext?: string
  onUploaded?: (files: UploadedFile[], fileUrl?: string) => void
  onReplace?: (file: File) => Promise<void>
  onDelete?: (url: string) => Promise<void>
  fileUrl?: string | null
  fileType?: 'image' | 'document' | 'video'
  multiple?: boolean
  showFilename?: boolean
}

export default function UploadPanel({
  fixedContext = 'lessons',
  onUploaded,
  onReplace,
  onDelete,
  fileUrl = null,
  fileType = 'image',
  multiple = false,
  showFilename = false,
}: UploadPanelProps) {
  const { uploadFile } = useSupabaseUpload()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ name?: string; size?: string }>({})

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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
      setFiles(valid)
      setMeta({
        name: valid[0].name,
        size: formatBytes(valid[0].size),
      })
      toast.success(`✅ Added ${valid.length} file(s)`)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    validateAndSetFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple,
    noClick: true,
    noKeyboard: true,
  })

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
          file,
          url: res.url,
          path: (res as any).path ?? '',
          bucket: 'eco-mentor-assets',
        })
        setMeta({
          name: file.name,
          size: formatBytes(file.size),
        })
        setProgressMap((prev) => ({ ...prev, [file.name]: 100 }))
      }

      const firstUrl = uploadedFiles[0]?.url
      toast.success(`✅ Uploaded ${uploadedFiles.length} file(s) successfully!`)
      onUploaded?.(uploadedFiles, firstUrl) // ✅ return the uploaded URL
      setFiles([])
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed.')
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full max-w-2xl mx-auto relative">
      {/* 🧩 Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        {fileType === 'image' && (
          <>
            <ImageIcon className="w-5 h-5 text-green-600" /> Upload Images
          </>
        )}
        {fileType === 'video' && (
          <>
            <Video className="w-5 h-5 text-green-600" /> Upload Videos
          </>
        )}
        {fileType === 'document' && (
          <>
            <FileUp className="w-5 h-5 text-green-600" /> Upload Files
          </>
        )}
      </h3>

      {/* 🎛 Buttons (always visible, improved) */}
      <div className="absolute top-3 right-3 flex gap-2 z-[100]">
        <div title={fileUrl ? 'Replace existing file' : 'Upload a file first'}>
          <Button
            size="sm"
            disabled={!fileUrl}
            className={`transition-all ${
              fileUrl
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-600 border border-gray-300 cursor-not-allowed opacity-90'
            }`}
            onClick={() =>
              fileUrl && document.getElementById(`replaceInput-${fileType}`)?.click()
            }
          >
            <RefreshCw size={14} className="mr-1" /> Replace
          </Button>
        </div>

        <div title={fileUrl ? 'Delete this file' : 'Upload a file first'}>
          <Button
            size="sm"
            disabled={!fileUrl}
            className={`transition-all ${
              fileUrl
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-600 border border-gray-300 cursor-not-allowed opacity-90'
            }`}
            onClick={() => fileUrl && onDelete?.(fileUrl)}
          >
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>

        <div title={fileUrl ? 'View this file' : 'Upload a file first'}>
          <a href={fileUrl || '#'} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              disabled={!fileUrl}
              className={`transition-all ${
                fileUrl
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-600 border border-gray-300 cursor-not-allowed opacity-90'
              }`}
            >
              <Download size={14} className="mr-1" /> View
            </Button>
          </a>
        </div>
      </div>

      {/* 🧠 Hidden replace input */}
      <input
        id={`replaceInput-${fileType}`}
        type="file"
        accept={
          fileType === 'video'
            ? 'video/*'
            : fileType === 'document'
            ? '.pdf,.doc,.docx,.ppt,.pptx'
            : 'image/*'
        }
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file && onReplace) {
            setMeta({ name: file.name, size: formatBytes(file.size) })
            await onReplace(file)
          }
        }}
      />

      {/* 📂 Dropzone or preview */}
      {fileUrl ? (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {fileType === 'video' && (
            <video src={fileUrl} controls className="w-full rounded-t-lg" />
          )}
          {fileType === 'image' && (
            <img src={fileUrl} alt="Uploaded file" className="w-full rounded-t-lg" />
          )}
          {fileType === 'document' && (
            <iframe
              src={fileUrl}
              className="w-full h-[300px] bg-white rounded-t-lg"
            />
          )}
        </div>
      ) : (
        <>
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
              Drag & drop files here, or click below to browse
            </p>
            <button
              onClick={(e) => {
                e.preventDefault()
                open()
              }}
              type="button"
              className="mt-3 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-all"
            >
              Browse Files
            </button>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className={`gap-2 ${
                uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800'
              } text-white`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </>
      )}

      {/* 📜 Filename */}
      {showFilename && meta.name && (
        <div className="bg-black/40 text-gray-200 px-4 py-2 border-t border-white/10 flex flex-col gap-1 text-xs mt-2">
          <div className="flex items-center gap-2">
            <Info size={12} className="text-green-300" />
            <span className="font-medium truncate">{meta.name}</span>
          </div>
          {meta.size && <p>Size: {meta.size}</p>}
        </div>
      )}

      {/* 📊 Progress */}
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

      {/* ❌ Error */}
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
