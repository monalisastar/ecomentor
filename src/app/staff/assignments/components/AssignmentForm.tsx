"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export type Assignment = {
  id?: string
  title: string
  description?: string
  course?: string
  module?: string
  dueDate?: string
  totalMarks?: number
  recurring?: boolean
  recurrenceInterval?: number
}

interface AssignmentFormProps {
  initialData?: Assignment
  onSubmit: (assignment: Assignment) => Promise<void> | void
  onCancel?: () => void
}

export default function AssignmentForm({
  initialData,
  onSubmit,
  onCancel,
}: AssignmentFormProps) {
  const [form, setForm] = useState<Assignment>({
    title: "",
    description: "",
    course: "",
    module: "",
    dueDate: "",
    totalMarks: undefined,
    recurring: false,
    recurrenceInterval: 1,
    ...initialData,
  })

  const [submitting, setSubmitting] = useState(false)

  const handleChange = <K extends keyof Assignment>(
    key: K,
    value: Assignment[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNumberChange = (key: "totalMarks" | "recurrenceInterval", value: string) => {
    const parsed = parseInt(value)
    setForm((prev) => ({ ...prev, [key]: isNaN(parsed) ? (key === "recurrenceInterval" ? 1 : 0) : parsed }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Assignment title is required")
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(form)
      // Clear form only if creating new assignment
      if (!form.id) {
        setForm({
          title: "",
          description: "",
          course: "",
          module: "",
          dueDate: "",
          totalMarks: undefined,
          recurring: false,
          recurrenceInterval: 1,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="bg-white/30 backdrop-blur-md border border-white/20 shadow-lg max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-sky-700 font-semibold">
          {form.id ? "Edit Assignment" : "Create Assignment"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter assignment title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter instructions"
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Course & Module */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input
              id="course"
              placeholder="Optional course"
              value={form.course || ""}
              onChange={(e) => handleChange("course", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Input
              id="module"
              placeholder="Optional module"
              value={form.module || ""}
              onChange={(e) => handleChange("module", e.target.value)}
            />
          </div>
        </div>

        {/* Due Date & Total Marks */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate || ""}
              onChange={(e) => handleChange("dueDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input
              id="totalMarks"
              type="number"
              placeholder="e.g., 100"
              value={form.totalMarks ?? ""}
              onChange={(e) => handleNumberChange("totalMarks", e.target.value)}
            />
          </div>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-4">
          <Switch
            checked={form.recurring}
            onCheckedChange={(val) => handleChange("recurring", val)}
          />
          <Label>Recurring Assignment?</Label>
        </div>

        {form.recurring && (
          <div className="space-y-2">
            <Label htmlFor="recurrenceInterval">Recurrence Interval (weeks)</Label>
            <Input
              id="recurrenceInterval"
              type="number"
              min={1}
              value={form.recurrenceInterval}
              onChange={(e) => handleNumberChange("recurrenceInterval", e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-4">
          <Button
            className="bg-sky-600 hover:bg-sky-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? form.id
                ? "Updating..."
                : "Creating..."
              : form.id
              ? "Update Assignment"
              : "Create Assignment"}
          </Button>

          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
