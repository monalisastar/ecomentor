'use client'

import { useState, useRef } from "react"

interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
}

export default function AssignmentSubmitPage({ params }: { params: { id: string } }) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [overallMessage, setOverallMessage] = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleFilesChange = (selectedFiles: FileList) => {
    const newFiles: FileUpload[] = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      if (file.size > 10 * 1024 * 1024) {
        setOverallMessage(`File "${file.name}" exceeds 10MB limit`)
        continue
      }
      if (files.some(f => f.file.name === file.name)) continue // skip duplicates
      newFiles.push({ file, progress: 0, status: 'pending' })
    }
    setFiles(prev => [...prev, ...newFiles])
    setOverallMessage(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) handleFilesChange(e.dataTransfer.files)
  }

  const uploadFile = async (fileUpload: FileUpload) => {
    return new Promise<void>((resolve) => {
      const formData = new FormData()
      formData.append('file', fileUpload.file)
      formData.append('studentId', 'mock-student-123') // Replace with actual studentId

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/assignments/${params.id}/submit`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, progress: Math.round((event.loaded / event.total) * 100), status: 'uploading' } : f))
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, progress: 100, status: 'success', message: '✅ Uploaded' } : f))
        } else {
          const resp = JSON.parse(xhr.responseText)
          setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'error', message: `❌ Error: ${resp.error}` } : f))
        }
        resolve()
      }
      xhr.onerror = () => {
        setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'error', message: '❌ Upload failed' } : f))
        resolve()
      }
      xhr.send(formData)
    })
  }

  const handleSubmitAll = async () => {
    for (const f of files.filter(f => f.status === 'pending')) {
      await uploadFile(f)
    }
  }

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file))
  }

  return (
    <div className="max-w-lg mx-auto p-6 backdrop-blur-sm bg-white/30 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-green-900 text-center">Submit Assignment</h1>

      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-green-400 rounded-xl p-8 text-center cursor-pointer hover:bg-green-50 transition mb-4"
        onClick={() => dropRef.current?.querySelector('input')?.click()}
      >
        <p className="text-green-800">Drag & drop files here, or click to select</p>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFilesChange(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-4 mb-4">
          {files.map(f => (
            <div key={f.file.name} className="p-3 border rounded-lg bg-white/50 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-green-900">{f.file.name}</p>
                  <p className="text-sm text-gray-700">{(f.file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={() => removeFile(f.file)}
                  disabled={f.status === 'uploading'}
                >
                  Remove
                </button>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full ${f.status === 'error' ? 'bg-red-600' : 'bg-green-600'} transition-all`}
                  style={{ width: `${f.progress}%` }}
                />
              </div>
              {f.message && <p className={`text-sm ${f.status === 'success' ? 'text-green-700' : 'text-red-600'}`}>{f.message}</p>}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmitAll}
        disabled={files.filter(f => f.status === 'pending').length === 0}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        Upload All
      </button>

      {overallMessage && <p className="mt-4 text-center text-red-600">{overallMessage}</p>}
    </div>
  )
}
