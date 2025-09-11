"use client"

import React, { useState, useEffect } from "react"
import AssignmentForm, { Assignment } from "./AssignmentForm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/services/api/assignments"

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch assignments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAssignments()
        setAssignments(data)
      } catch (err) {
        toast.error("Failed to load assignments")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Add or update assignment
  const handleSubmit = async (assignment: Assignment) => {
    try {
      let updatedAssignment: Assignment
      if (assignment.id) {
        updatedAssignment = await updateAssignment(assignment.id, assignment)
        setAssignments((prev) =>
          prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
        )
        toast.success("Assignment updated")
      } else {
        updatedAssignment = await createAssignment(assignment)
        setAssignments((prev) => [...prev, updatedAssignment])
        toast.success("Assignment created")
      }
    } catch (err) {
      toast.error("Failed to submit assignment")
      console.error(err)
    } finally {
      setEditingAssignment(null)
      setShowForm(false)
    }
  }

  // Delete assignment
  const handleDelete = async (id?: string) => {
    if (!id) return
    try {
      await deleteAssignment(id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
      toast.success("Assignment deleted")
    } catch (err) {
      toast.error("Failed to delete assignment")
      console.error(err)
    }
  }

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading assignments...</p>

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-sky-700">Assignments</h2>
        <Button
          className="bg-sky-600 hover:bg-sky-700"
          onClick={() => {
            setEditingAssignment(null)
            setShowForm(true)
          }}
        >
          + New Assignment
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <AssignmentForm
          initialData={editingAssignment || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <p className="text-center text-gray-500">No assignments yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <Card
              key={a.id}
              className="bg-white/30 backdrop-blur-md border border-white/20 shadow-md"
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sky-700 text-lg">{a.title}</CardTitle>
                  {a.description && (
                    <p className="text-gray-600 text-sm">{a.description}</p>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    Due: {a.dueDate || "—"} | Marks: {a.totalMarks ?? "—"}
                    {a.recurring && ` | Recurs every ${a.recurrenceInterval} week(s)`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAssignment(a)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
