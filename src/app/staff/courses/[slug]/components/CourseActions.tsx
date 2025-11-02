'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Eye, Loader2, Trash2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

export default function CourseActions({
  slug,
  published,
  onPublish,
}: {
  slug: string
  published: boolean
  onPublish: () => Promise<void> | void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 🗑️ Delete course
  const handleDelete = async () => {
    if (!confirm("⚠️ This will permanently delete the course and all lessons. Continue?"))
      return
    try {
      setDeleting(true)
      const res = await fetch(`/api/staff/courses/${slug}/delete`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("🗑️ Course deleted successfully!")
        router.push("/dashboard/staff/courses")
      } else throw new Error(data.error)
    } catch (err: any) {
      console.error(err)
      toast.error("❌ Failed to delete course")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* ⚙️ Left-side actions */}
        <div className="flex gap-3 flex-wrap">
          {/* Publish / Unpublish */}
          <button
            onClick={async () => {
              setLoading(true)
              try {
                await onPublish()
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white transition ${
              published
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Globe size={16} />
            )}
            {published ? "Unpublish Course" : "Publish Course"}
          </button>

          {/* Preview Course */}
          {published && (
            <button
              onClick={() => window.open(`/courses/${slug}`, "_blank")}
              className="px-4 py-2 rounded-lg flex items-center gap-2 border border-green-600 text-green-700 hover:bg-green-50 transition"
            >
              <Eye size={16} /> Preview
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-300 hover:bg-gray-100 text-gray-700 transition"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        {/* Delete Course */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Deleting...
            </>
          ) : (
            <>
              <Trash2 size={16} /> Delete Course
            </>
          )}
        </button>
      </div>
    </section>
  )
}
