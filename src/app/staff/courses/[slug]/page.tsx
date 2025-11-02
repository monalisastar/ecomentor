'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import CourseHeader from "./components/CourseHeader"
import CourseStatus from "./components/CourseStatus"
import CourseInfoForm from "./components/CourseInfoForm"
import CourseAutoImport from "./components/CourseAutoImport"
import CourseModulesList from "./components/CourseModulesList"
import CourseAddModuleModal from "./components/CourseAddModuleModal"
import CourseActions from "./components/CourseActions"

import { useCourseModules } from "./hooks/useCourseModules"

export default function CourseEditorPage() {
  const { slug } = useParams()
  const router = useRouter()
  const {
    modules,
    fetchModules,
    loadingModules,
    showAddModal,
    setShowAddModal,
    handleAddModule,
    creatingModule,
    newModuleTitle,
    setNewModuleTitle,
  } = useCourseModules(slug as string)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [published, setPublished] = useState(false)

  const handleSave = async () => {
    try {
      const res = await fetch("/api/staff/courses/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, description }),
      })
      const data = await res.json()
      if (data.success) toast.success("✅ Course saved successfully!")
      else toast.error("⚠️ Failed to save course.")
    } catch (error) {
      console.error(error)
      toast.error("❌ Error saving course.")
    }
  }

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this course?")) return
    try {
      const res = await fetch("/api/staff/courses/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, description }),
      })
      const data = await res.json()
      if (data.success) {
        setPublished(true)
        toast.success("🎉 Course published successfully!")
      } else toast.error("⚠️ Failed to publish course.")
    } catch (error) {
      console.error(error)
      toast.error("❌ Error publishing course.")
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-[88px] space-y-10">
      <CourseHeader
        slug={slug as string}
        title={title}
        setTitle={setTitle}
        onSave={handleSave}
      />

      <CourseStatus published={published} slug={slug as string} />

      <CourseInfoForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
      />

      <CourseAutoImport slug={slug as string} fetchModules={fetchModules} />

      <CourseModulesList
        modules={modules}
        fetchModules={fetchModules}
        loadingModules={loadingModules}
        onAddModule={() => setShowAddModal(true)}
      />

      <CourseActions
        slug={slug as string}
        published={published}
        onPublish={handlePublish}
      />

      <CourseAddModuleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newModuleTitle={newModuleTitle}
        setNewModuleTitle={setNewModuleTitle}
        onAdd={handleAddModule}
        creating={creatingModule}
      />
    </main>
  )
}
