"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, FileText } from "lucide-react"

export type Assignment = {
  id: string
  title: string
  course?: string
  module?: string
  dueDate?: string
  totalMarks?: number
}

interface AssignmentListProps {
  assignments?: Assignment[]
  onEdit?: (assignment: Assignment) => void
  onDelete?: (assignment: Assignment) => void
  onViewSubmissions?: (assignment: Assignment) => void
}

export default function AssignmentList({
  assignments = [],
  onEdit,
  onDelete,
  onViewSubmissions,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return <p className="text-center text-gray-500">No assignments created yet.</p>
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card
          key={assignment.id}
          className="bg-white/30 backdrop-blur-md border border-white/20 shadow-lg"
        >
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-sky-700 font-semibold">
                {assignment.title}
              </CardTitle>

              {(assignment.course || assignment.module) && (
                <p className="text-sm text-gray-600">
                  {[
                    assignment.course ? `Course: ${assignment.course}` : null,
                    assignment.module ? `Module: ${assignment.module}` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Due: {assignment.dueDate ?? "—"} • Marks: {assignment.totalMarks ?? "—"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {onViewSubmissions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewSubmissions(assignment)}
                  className="flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" /> Submissions
                </Button>
              )}

              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(assignment)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(assignment)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
