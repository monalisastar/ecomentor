'use client'

import { useState } from 'react'
import { CheckCircle2, UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import PublishConfirmModal from './PublishConfirmModal'


interface Props {
  courseSlug: string
  isPublished: boolean
}

export default function CoursePublishButton({ courseSlug, isPublished }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePublish = async () => {
    setLoading(true)
    try {
      // 🧠 The API route will be created later: /api/staff/courses/[slug]/publish
      const res = await fetch(`/api/staff/courses/${courseSlug}/publish`, {
        method: 'PATCH',
      })

      if (!res.ok) throw new Error('Failed to publish course')
      toast.success('🎉 Course published successfully!')
      window.location.reload()
    } catch (err) {
      toast.error('Failed to publish. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (isPublished)
    return (
      <Button disabled variant="outline" className="gap-2 text-green-500 border-green-500/40">
        <CheckCircle2 className="w-4 h-4" />
        Published
      </Button>
    )

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white gap-2"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        Publish Course
      </Button>

      <PublishConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handlePublish}
      />
    </>
  )
}
