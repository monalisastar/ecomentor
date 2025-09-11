"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload } from "lucide-react"

export default function Step1CoreInfo({
  data,
  setData,
}: {
  data: any
  setData: (val: any) => void
}) {
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setData({ ...data, thumbnail: e.target.files[0] })
    }
  }

  const addTag = () => {
    if (data.newTag && !data.tags?.includes(data.newTag)) {
      setData({
        ...data,
        tags: [...(data.tags || []), data.newTag],
        newTag: "",
      })
    }
  }

  const removeTag = (tag: string) => {
    setData({ ...data, tags: data.tags.filter((t: string) => t !== tag) })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">
        Step 1: Course Core Information
      </h2>

      {/* Thumbnail Upload */}
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <Label className="text-white">Course Thumbnail</Label>
          <div className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-white/30 p-6 rounded-xl bg-white/5">
            {data.thumbnail ? (
              <img
                src={URL.createObjectURL(data.thumbnail)}
                alt="thumbnail preview"
                className="w-48 h-32 object-cover rounded-xl shadow-md"
              />
            ) : (
              <Upload className="w-10 h-10 text-gray-300" />
            )}
            <Input
              type="file"
              accept="image/*"
              className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white file:text-white file:bg-teal-500/70 file:border-none file:rounded-md file:px-3 file:py-1 hover:file:bg-teal-400"
              onChange={handleThumbnailUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Title */}
      <div>
        <Label className="text-white">Course Title</Label>
        <Input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="e.g., GHG Accounting Basics"
          className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Short Description */}
      <div>
        <Label className="text-white">Short Description</Label>
        <Textarea
          value={data.shortDescription}
          onChange={(e) =>
            setData({ ...data, shortDescription: e.target.value })
          }
          placeholder="A brief overview shown in the course catalog."
          className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Full Description */}
      <div>
        <Label className="text-white">Full Description</Label>
        <Textarea
          value={data.fullDescription}
          onChange={(e) =>
            setData({ ...data, fullDescription: e.target.value })
          }
          placeholder="A detailed description of the course content."
          rows={6}
          className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Category */}
      <div>
        <Label className="text-white">Category</Label>
        <Select
          value={data.category}
          onValueChange={(val) => setData({ ...data, category: val })}
        >
          <SelectTrigger className="mt-2 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white shadow-md hover:bg-white/20 transition">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl text-white">
            <SelectItem value="ghg">GHG Accounting</SelectItem>
            <SelectItem value="carbon-project">Carbon Project Development</SelectItem>
            <SelectItem value="scope">Scope 1, 2 & 3</SelectItem>
            <SelectItem value="afolu">AFOLU</SelectItem>
            <SelectItem value="carbon-markets">Carbon Markets & Trading</SelectItem>
            <SelectItem value="climate-policy">Climate Policy & Standards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-white">Difficulty Level</Label>
        <Select
          value={data.difficulty}
          onValueChange={(val) => setData({ ...data, difficulty: val })}
        >
          <SelectTrigger className="mt-2 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white shadow-md hover:bg-white/20 transition">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl text-white">
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="practitioner">Practitioner</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-white">Tags</Label>
        <div className="flex gap-2 mt-3 flex-wrap">
          {data.tags?.map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-teal-500/40 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-1"
            >
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={data.newTag || ""}
            onChange={(e) => setData({ ...data, newTag: e.target.value })}
            placeholder="Enter a tag"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-teal-400"
          />
          <Button
            type="button"
            onClick={addTag}
            className="bg-teal-500/70 backdrop-blur-sm hover:bg-teal-400 text-white rounded-lg shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
