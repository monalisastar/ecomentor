'use client'

import { useState, useEffect } from 'react'
import { Eye, Save, RefreshCw } from 'lucide-react'
import UploadPanel from '@/components/UploadPanel'
import { toast } from 'sonner'

export default function CertificateBuilder() {
  const [logoUrl, setLogoUrl] = useState('')
  const [signatureUrl, setSignatureUrl] = useState('')
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [color, setColor] = useState('#1B5E20')
  const [loading, setLoading] = useState(false)

  // 🧩 Load lecturer’s saved design
  const loadDesign = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/certificates/design')
      if (!res.ok) throw new Error('Failed to load saved design')
      const data = await res.json()

      if (data) {
        setLogoUrl(data.logoUrl || '')
        setSignatureUrl(data.signatureUrl || '')
        setBackgroundUrl(data.backgroundUrl || '')
        setColor(data.color || '#1B5E20')
        toast.success('Loaded your saved layout 🎨')
      } else {
        toast.info('No saved layout found yet.')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 💾 Save lecturer’s design via API
  const handleSaveDesign = async () => {
    try {
      setLoading(true)
      const payload = { logoUrl, signatureUrl, backgroundUrl, color }

      const res = await fetch('/api/certificates/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) toast.success('Certificate layout saved successfully ✅')
      else toast.error('Failed to save design')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-load existing design on mount
  useEffect(() => {
    loadDesign()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Certificate Builder 🪶
      </h1>

      {/* 🧩 Upload sections */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h2 className="font-medium mb-2 text-gray-700">Logo</h2>
          <UploadPanel
            fixedContext="certificates/logo"
            onUploaded={(files) => {
              if (files[0]) setLogoUrl(files[0].url)
            }}
            fileType="image"
          />
        </div>

        <div>
          <h2 className="font-medium mb-2 text-gray-700">Signature</h2>
          <UploadPanel
            fixedContext="certificates/signature"
            onUploaded={(files) => {
              if (files[0]) setSignatureUrl(files[0].url)
            }}
            fileType="image"
          />
        </div>

        <div>
          <h2 className="font-medium mb-2 text-gray-700">
            Background (optional)
          </h2>
          <UploadPanel
            fixedContext="certificates/background"
            onUploaded={(files) => {
              if (files[0]) setBackgroundUrl(files[0].url)
            }}
            fileType="image"
          />
        </div>
      </div>

      {/* 🎨 Customization options */}
      <div className="mt-8">
        <label className="text-sm text-gray-700 block mb-2">Primary Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-20 h-10 rounded-lg border border-gray-300"
        />
      </div>

      {/* 🔘 Actions */}
      <div className="flex flex-wrap gap-3 mt-10">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Eye size={16} /> {previewMode ? 'Hide Preview' : 'Preview'}
        </button>

        <button
          onClick={handleSaveDesign}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save size={16} /> Save Layout
        </button>

        <button
          onClick={loadDesign}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Load My Saved Layout
        </button>
      </div>

      {/* 🖼️ Live Preview */}
      {previewMode && (
        <div className="mt-10 bg-white border rounded-lg shadow-md p-8 relative">
          {backgroundUrl && (
            <img
              src={backgroundUrl}
              alt="background"
              className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-lg"
            />
          )}
          <div className="relative z-10 text-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                className="mx-auto mb-6 w-24 h-auto"
              />
            )}
            <h2 className="text-3xl font-bold mb-2" style={{ color }}>
              Certificate of Completion
            </h2>
            <p className="text-gray-700 mt-4">
              This certifies that <strong>Student Name</strong> has successfully
              completed the course <strong>Course Title</strong>.
            </p>
            {signatureUrl && (
              <img
                src={signatureUrl}
                alt="signature"
                className="mx-auto mt-10 w-40"
              />
            )}
            <p className="text-sm text-gray-500 mt-2">Authorized Lecturer</p>
          </div>
        </div>
      )}
    </div>
  )
}
