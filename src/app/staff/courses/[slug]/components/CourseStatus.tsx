'use client'

import { Globe, Clock3, RefreshCcw, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function CourseStatus({
  published,
  slug,
  lastUpdated,
  lastPublished,
  onStatusChange,
}: {
  published: boolean
  slug: string
  lastUpdated?: string
  lastPublished?: string
  onStatusChange?: (newStatus: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 🔁 Toggle publish/unpublish
  const handleTogglePublish = async () => {
    const action = published ? "unpublish" : "republish"
    const confirmAction = confirm(
      `Are you sure you want to ${action} this course?`
    )
    if (!confirmAction) return

    setLoading(true)
    try {
      const res = await fetch(`/api/staff/courses/${slug}/${action}`, {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(
          published
            ? "🟠 Course unpublished successfully."
            : "✅ Course republished successfully."
        )
        onStatusChange?.(!published)
      } else {
        toast.error(data.error || "⚠️ Failed to update status.")
      }
    } catch (error) {
      console.error("❌ Error toggling status:", error)
      toast.error("An error occurred while updating course status.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4 gap-4">
      {/* 🧭 Left — Status & Dates */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* 🟢 Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            published
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {published ? "✅ Published" : "🕓 Draft"}
        </div>

        {/* 🕓 Last Updated Info */}
        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-2">
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock3 size={12} /> Updated:{" "}
              {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
          {published && lastPublished && (
            <span className="flex items-center gap-1">
              <Globe size={12} /> Published:{" "}
              {new Date(lastPublished).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* ⚙️ Right — Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 🌍 View Live Button */}
        {published && (
          <button
            onClick={() => router.push(`/courses/${slug}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Globe size={14} /> View Live
          </button>
        )}

        {/* 🔁 Publish / Unpublish Button */}
        <button
          onClick={handleTogglePublish}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-white text-sm transition ${
            published
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } disabled:opacity-50`}
        >
          {loading ? (
            <>
              <RefreshCcw size={14} className="animate-spin" /> Updating...
            </>
          ) : published ? (
            <>
              <XCircle size={14} /> Unpublish
            </>
          ) : (
            <>
              <RefreshCcw size={14} /> Republish
            </>
          )}
        </button>
      </div>
    </div>
  )
}
