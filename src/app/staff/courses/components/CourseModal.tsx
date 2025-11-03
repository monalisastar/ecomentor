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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, ImagePlus } from 'lucide-react'
import UploadPanel from '@/components/UploadPanel'

interface CourseModalProps {
  open: boolean
  onClose: () => void
  onCourseCreated?: () => void
}

export default function CourseModal({
  open,
  onClose,
  onCourseCreated,
}: CourseModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tier, setTier] = useState('')
  const [scope, setScope] = useState('')
  const [priceUSD, setPriceUSD] = useState('')
  const [language, setLanguage] = useState('English')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!title || !category) {
      toast.error('Title and category are required.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          tier,
          scope,
          priceUSD: parseFloat(priceUSD) || 0,
          language,
          description,
          image: imageUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to create course')
      toast.success('Course created successfully!')
      await onCourseCreated?.()
      onClose()

      // reset
      setTitle('')
      setDescription('')
      setCategory('')
      setTier('')
      setScope('')
      setImageUrl(null)
      setPriceUSD('')
      setLanguage('English')
    } catch (err: any) {
      toast.error(err.message || 'Error creating course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 🖼 Cover Image */}
          <div className="flex flex-col gap-2">
            <Label>Course Cover Image</Label>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Course Cover"
                className="w-full h-48 object-cover rounded-lg border"
              />
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                <ImagePlus className="mx-auto mb-2" />
                Upload a course cover
              </div>
            )}

            {/* IMPORTANT: UploadPanel now returns an array of files */}
            <UploadPanel
              fixedContext="course-covers"
              fileType="image"
              multiple={false}
              onUploaded={(files) => {
                const first = files?.[0]?.url ?? null
                setImageUrl(first)
              }}
            />
          </div>

          {/* 🏷 Title */}
          <div className="flex flex-col gap-2">
            <Label>Course Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Carbon Accounting"
            />
          </div>

          {/* 🌿 Category */}
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GHG_ACCOUNTING">GHG Accounting</SelectItem>
                <SelectItem value="CARBON_PROJECT_DEVELOPMENT">
                  Carbon Project Development
                </SelectItem>
                <SelectItem value="CARBON_MARKETS">Carbon Markets</SelectItem>
                <SelectItem value="MRV_SYSTEMS">MRV Systems</SelectItem>
                <SelectItem value="CARBON_POLICY">Carbon Policy</SelectItem>
                <SelectItem value="CLIMATE_FINANCE">Climate Finance</SelectItem>
                <SelectItem value="SUSTAINABLE_AGRICULTURE">
                  Sustainable Agriculture
                </SelectItem>
                <SelectItem value="ENERGY_EFFICIENCY">Energy Efficiency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 🧩 Tier + Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Tier</Label>
              <Select onValueChange={setTier} value={tier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOUNDATIONAL">Foundational</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="ADVANCED_PRACTITIONER">
                    Advanced Practitioner
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>GHG Scope</Label>
              <Select onValueChange={setScope} value={scope}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCOPE1">Scope 1</SelectItem>
                  <SelectItem value="SCOPE2">Scope 2</SelectItem>
                  <SelectItem value="SCOPE3">Scope 3</SelectItem>
                  <SelectItem value="CROSS_SCOPE">Cross-Scope</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 💬 Description */}
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this course covers..."
              rows={4}
            />
          </div>

          {/* 🌐 Language + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Language</Label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Swahili">Swahili</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Price (USD)</Label>
              <Input
                type="number"
                value={priceUSD}
                onChange={(e) => setPriceUSD(e.target.value)}
                placeholder="e.g. 59.99"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white flex items-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={18} />}
            {saving ? 'Saving...' : 'Create Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
