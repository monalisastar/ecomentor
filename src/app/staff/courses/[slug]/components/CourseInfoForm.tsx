'use client'

import { useState, useEffect, useCallback } from "react"
import { Loader2, CheckCircle2, Lock } from "lucide-react"
import { toast } from "sonner"
import { useSupabaseUpload } from "@/hooks/useSupabaseUpload"

export default function CourseInfoForm({
  slug,
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  published,
  onSave,
}: {
  slug: string
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  category: string
  setCategory: (v: string) => void
  published: boolean
  onSave: () => Promise<void> | void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [language, setLanguage] = useState<"en" | "fr" | "sw">("en")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const { uploadFile, progress } = useSupabaseUpload()

  // 🧠 Auto-load existing course image
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/staff/courses/${slug}/image`)
        if (res.ok) {
          const data = await res.json()
          if (data.image) setImageUrl(data.image)
        }
      } catch (err) {
        console.warn("No image found or failed to load")
      }
    }
    if (slug) fetchImage()
  }, [slug])

  // 🧠 Debounced Auto-Save (every 30 seconds)
  const autoSave = useCallback(async () => {
    if (!slug || published) return
    try {
      await onSave()
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 4000)
    } catch {
      toast.error("Auto-save failed.")
    }
  }, [slug, title, description, category, published, onSave])

  useEffect(() => {
    const interval = setInterval(() => autoSave(), 30000)
    return () => clearInterval(interval)
  }, [autoSave])

  // 💾 Manual Save
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setAutoSaved(false)
      await onSave()
      setAutoSaved(true)
      toast.success("✅ Course details saved successfully!")
      setTimeout(() => setAutoSaved(false), 3000)
    } catch (error) {
      console.error(error)
      toast.error("❌ Error saving course information.")
    } finally {
      setIsSaving(false)
    }
  }

  // 📤 Upload Course Image + Save to DB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("⚠️ Image too large (max 10 MB)")
      return
    }

    try {
      setUploading(true)
      toast.info("📤 Uploading image to Supabase…")

      const result = await uploadFile(file, "course-images")
      if (!result.success) throw new Error(result.error || "Upload failed")

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${result.bucket}/${result.path}`
      setImageUrl(publicUrl)

      toast.success("✅ Image uploaded! Saving to database…")

      // 💾 Update image in database immediately
      const res = await fetch(`/api/staff/courses/${slug}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: publicUrl }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "DB update failed")

      toast.success("🖼️ Course thumbnail updated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("❌ Failed to upload or save image")
    } finally {
      setUploading(false)
    }
  }

  const isReadOnly = published

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Course Information</h2>
        {isReadOnly && (
          <span className="flex items-center gap-1 text-gray-500 text-sm">
            <Lock size={14} /> Read-only (Published)
          </span>
        )}
      </div>

      {/* 🌍 Language & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            disabled={isReadOnly}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="sw">Swahili</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isReadOnly}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select category</option>
            <option value="GHG Accounting">GHG Accounting</option>
            <option value="Carbon Markets">Carbon Markets</option>
            <option value="Sustainability Reporting">Sustainability Reporting</option>
            <option value="Climate Policy">Climate Policy</option>
            <option value="Renewable Energy">Renewable Energy</option>
          </select>
        </div>
      </div>

      {/* 🧾 Title & Description */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title ({language.toUpperCase()})
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            disabled={isReadOnly}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description ({language.toUpperCase()})
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed course description"
            disabled={isReadOnly}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* 🖼️ Course Image Upload */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Thumbnail
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isReadOnly || uploading}
            className="text-sm"
          />
          {uploading && (
            <div className="flex items-center text-gray-600 text-sm gap-2">
              <Loader2 size={14} className="animate-spin" /> Uploading... {progress ?? 0}%
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Course thumbnail"
              className="w-20 h-20 object-cover rounded-lg border"
            />
          )}
        </div>
      </div>

      {/* 💾 Save Draft */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
        {autoSaved && (
          <span className="text-green-600 text-sm flex items-center gap-1">
            <CheckCircle2 size={14} /> Auto-saved
          </span>
        )}
        {!isReadOnly && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              "Save Draft"
            )}
          </button>
        )}
      </div>
    </section>
  )
}
