'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Layers } from 'lucide-react'

interface ModuleAddModalProps {
  open: boolean
  onClose: () => void
  courseSlug: string
  onModuleCreated?: () => Promise<void> | void
}

export default function ModuleAddModal({
  open,
  onClose,
  courseSlug,
  onModuleCreated,
}: ModuleAddModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [objectives, setObjectives] = useState('') // ✅ new field
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Module title is required.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/courses/${courseSlug}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, objectives }), // ✅ include objectives
      })

      if (!res.ok) throw new Error('Failed to create module.')
      toast.success('✅ Module created successfully!')

      await onModuleCreated?.()
      onClose()

      // reset form
      setTitle('')
      setDescription('')
      setObjectives('')
    } catch (err: any) {
      toast.error(err.message || 'Error creating module.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
            <Layers className="text-green-300" size={20} />
            Add New Module
          </DialogTitle>
          <p className="text-sm text-gray-300 mt-1">
            Create a new module under this course to organize lessons and set clear learning outcomes.
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Module Title */}
          <div className="flex flex-col gap-2">
            <Label className="text-gray-200">Module Title</Label>
            <Input
              placeholder="e.g. Introduction to Carbon Accounting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:ring-green-400 focus:border-green-400"
            />
          </div>

          {/* Module Description */}
          <div className="flex flex-col gap-2">
            <Label className="text-gray-200">Description (optional)</Label>
            <Textarea
              placeholder="Describe what this module will cover..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:ring-green-400 focus:border-green-400"
            />
          </div>

          {/* Module Objectives */}
          <div className="flex flex-col gap-2">
            <Label className="text-gray-200">Module Objectives (optional)</Label>
            <Textarea
              placeholder="List the learning objectives for this module (e.g. bullet points or a short paragraph)..."
              rows={4}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:ring-green-400 focus:border-green-400"
            />
            <p className="text-xs text-gray-400">
              Tip: Summarize what learners should achieve by the end of this module.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition-all"
          >
            {saving && <Loader2 className="animate-spin" size={18} />}
            {saving ? 'Saving...' : 'Save Module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
