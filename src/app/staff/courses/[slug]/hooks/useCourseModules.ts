'use client'

import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * 🧠 useCourseModules — Eco-Mentor LMS
 * ------------------------------------------------------------
 * Handles fetching, adding, and managing course modules + lessons.
 * Keeps CourseEditorPage and its components clean.
 */
export function useCourseModules(slug: string) {
  const [modules, setModules] = useState<any[]>([])
  const [loadingModules, setLoadingModules] = useState<boolean>(true)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [newModuleTitle, setNewModuleTitle] = useState<string>("")
  const [creatingModule, setCreatingModule] = useState<boolean>(false)

  // 🧩 Fetch modules for a specific course
  const fetchModules = async () => {
    if (!slug) return
    try {
      setLoadingModules(true)
      const res = await fetch(`/api/modules?courseSlug=${slug}`)
      const data = await res.json()

      const modulesArray = Array.isArray(data)
        ? data
        : Array.isArray(data.modules)
        ? data.modules
        : []

      setModules(modulesArray)
    } catch (error) {
      console.error("❌ Failed to fetch modules:", error)
      toast.error("Failed to fetch modules.")
      setModules([])
    } finally {
      setLoadingModules(false)
    }
  }

  // ➕ Create new module manually
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error("Module title is required.")
      return
    }
    setCreatingModule(true)

    try {
      // 1️⃣ Verify course exists
      const courseRes = await fetch(`/api/courses/${slug}`)
      const courseData = await courseRes.json()
      if (!courseRes.ok || !courseData?.id) {
        toast.error("❌ Course not found or invalid slug.")
        setCreatingModule(false)
        return
      }

      // 2️⃣ Create module
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseData.id,
          title: newModuleTitle.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("✅ Module added successfully!")
        setShowAddModal(false)
        setNewModuleTitle("")
        await fetchModules()
      } else {
        toast.error(data.error || "⚠️ Failed to add module.")
      }
    } catch (error) {
      console.error("❌ Error adding module:", error)
      toast.error("Error adding module.")
    } finally {
      setCreatingModule(false)
    }
  }

  // 🔁 Auto-refresh modules when slug changes or file import finishes
  useEffect(() => {
    if (!slug) return
    fetchModules()

    // Listen for "imported" custom event to auto-refresh after file imports
    const handleImported = () => fetchModules()
    window.addEventListener("imported", handleImported)
    return () => window.removeEventListener("imported", handleImported)
  }, [slug])

  return {
    modules,
    fetchModules,
    loadingModules,
    showAddModal,
    setShowAddModal,
    handleAddModule,
    creatingModule,
    newModuleTitle,
    setNewModuleTitle,
  }
}
