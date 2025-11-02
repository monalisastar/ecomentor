'use client'

import Link from "next/link"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useState } from "react"

export default function CourseHeader({
  slug,
  title,
  setTitle,
  onSave,
}: {
  slug: string
  title: string
  setTitle: (v: string) => void
  onSave: () => Promise<void> | void
}) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <header className="flex items-center justify-between flex-wrap gap-3">
      {/* 🔙 Back + Title */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/staff/courses"
          className="text-gray-600 hover:text-green-700 transition flex items-center gap-1"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Course —{" "}
          {title
            ? title
            : slug?.toString().replace(/-/g, " ").replace(/\b\w/g, (c) =>
                c.toUpperCase()
              )}
        </h1>
      </div>

      {/* 💾 Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
      >
        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </header>
  )
}
