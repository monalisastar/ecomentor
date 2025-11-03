'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import UploadPanel from '@/components/UploadPanel'

interface CourseFormProps {
  mode: 'create' | 'edit'
  slug?: string
  initialData?: any
  onSuccess?: () => void
}

export default function CourseForm({
  mode,
  slug,
  initialData,
  onSuccess,
}: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [tier, setTier] = useState(initialData?.tier || '')
  const [scope, setScope] = useState(initialData?.scope || '')
  const [priceUSD, setPriceUSD] = useState(initialData?.priceUSD?.toString() || '')
  const [language, setLanguage] = useState(initialData?.language || 'English')
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image || null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setCategory(initialData.category || '')
      setTier(initialData.tier || '')
      setScope(initialData.scope || '')
      setPriceUSD(initialData.priceUSD?.toString() || '')
      setLanguage(initialData.language || 'English')
      setDescription(initialData.description || '')
      setImageUrl(initialData.image || null)
    }
  }, [initialData])

  const handleSubmit = async () => {
    if (!title || !category) {
      toast.error('Title and category are required.')
      return
    }

    try {
      setSaving(true)
      const payload = {
        title,
        category,
        tier,
        scope,
        priceUSD: parseFloat(priceUSD) || 0,
        language,
        description,
        image: imageUrl,
      }

      const res = await fetch(
        mode === 'edit' && slug ? `/api/courses/${slug}` : '/api/courses',
        {
          method: mode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) throw new Error('Failed to save course')

      toast.success(
        mode === 'edit'
          ? 'Course updated successfully!'
          : 'Course created successfully!'
      )
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Error saving course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 transition-all">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">
        {mode === 'edit' ? 'Edit Course' : 'Create New Course'}
      </h2>

      <div className="grid gap-6">
        {/* 🖼 Cover Image */}
        <div className="flex flex-col gap-3">
          <Label className="text-gray-100 font-medium">Course Cover Image</Label>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Course Cover"
              className="w-full h-48 object-cover rounded-xl border border-white/30 shadow-md"
            />
          ) : (
            <div className="border border-dashed border-white/40 rounded-xl p-6 text-center text-gray-200 backdrop-blur-md">
              <ImagePlus className="mx-auto mb-2 opacity-80" />
              Upload a course cover
            </div>
          )}

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
          <Label className="text-gray-100 font-medium">Course Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Carbon Accounting"
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:ring-green-400"
          />
        </div>

        {/* 🌿 Category */}
        <div className="flex flex-col gap-2">
          <Label className="text-gray-100 font-medium">Category</Label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/80 text-white border-white/30">
              <SelectItem value="GHG_ACCOUNTING">GHG Accounting</SelectItem>
              <SelectItem value="CARBON_PROJECT_DEVELOPMENT">Carbon Project Development</SelectItem>
              <SelectItem value="CARBON_MARKETS">Carbon Markets</SelectItem>
              <SelectItem value="MRV_SYSTEMS">MRV Systems</SelectItem>
              <SelectItem value="CARBON_POLICY">Carbon Policy</SelectItem>
              <SelectItem value="CLIMATE_FINANCE">Climate Finance</SelectItem>
              <SelectItem value="SUSTAINABLE_AGRICULTURE">Sustainable Agriculture</SelectItem>
              <SelectItem value="ENERGY_EFFICIENCY">Energy Efficiency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🧩 Tier + Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-gray-100 font-medium">Tier</Label>
            <Select onValueChange={setTier} value={tier}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/80 text-white border-white/30">
                <SelectItem value="FOUNDATIONAL">Foundational</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ADVANCED_PRACTITIONER">Advanced Practitioner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-100 font-medium">GHG Scope</Label>
            <Select onValueChange={setScope} value={scope}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/80 text-white border-white/30">
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
          <Label className="text-gray-100 font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this course covers..."
            rows={4}
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
          />
        </div>

        {/* 🌐 Language + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-gray-100 font-medium">Language</Label>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/80 text-white border-white/30">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Swahili">Swahili</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-100 font-medium">Price (USD)</Label>
            <Input
              type="number"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              placeholder="e.g. 59.99"
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600/90 hover:bg-green-700 text-white shadow-lg hover:shadow-green-400/30 transition-all flex items-center gap-2 px-6 py-2 rounded-lg"
        >
          {saving && <Loader2 className="animate-spin" size={18} />}
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </div>
  )
}
