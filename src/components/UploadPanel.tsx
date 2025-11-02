"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { UploadCloud, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react"
import { useSupabaseUpload } from "@/hooks/useSupabaseUpload"

type CourseImageUploadPanelProps = {
  onUploaded?: (url: string) => void
  initialUrl?: string | null
}

export default function CourseImageUploadPanel({
  onUploaded,
  initialUrl = null,
}: CourseImageUploadPanelProps) {
  const { uploadFile, progress, error, fileUrl } = useSupabaseUpload()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!")
    setUploading(true)
    const result = await uploadFile(file, "course-images")
    setUploading(false)

    if (result.success && result.url) {
      setPreview(result.url)
      if (onUploaded) onUploaded(result.url)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-green-600" /> Course Cover Image
      </h3>

      {/* Current Preview */}
      {preview ? (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Course preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg mb-4 text-gray-500">
          <ImageIcon className="w-10 h-10 mb-2" />
          <p className="text-sm">No image uploaded</p>
        </div>
      )}

      {/* File Picker */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition text-gray-700 font-medium">
          <UploadCloud className="w-4 h-4" />
          {file ? file.name : "Choose File"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition ${
            file && !uploading
              ? "bg-green-700 hover:bg-green-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut", duration: 0.3 }}
          />
        </div>
      )}

      {/* Success */}
      {fileUrl && (
        <motion.div
          className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle className="text-green-600" />
          <p className="text-green-700 text-sm truncate">
            ✅ Uploaded successfully —{" "}
            <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">
              View Image
            </a>
          </p>
        </motion.div>
      )}

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
