"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssignmentList from "./components/AssignmentList";
import AssignmentForm, { Assignment } from "./components/AssignmentForm";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { getAssignments, createAssignment, updateAssignment } from "@/services/api/assignments";
import { toast } from "react-hot-toast";

export default function AssignmentsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch assignments on mount
  useEffect(() => {
    let isMounted = true;

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await getAssignments();
        if (!isMounted) return;
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch assignments");
        setAssignments([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormSubmit = async (assignment: Assignment) => {
    try {
      if (assignment.id) {
        await updateAssignment(assignment.id, assignment);
        toast.success("Assignment updated");
      } else {
        await createAssignment(assignment);
        toast.success("Assignment created");
      }

      setShowForm(false);
      setEditingAssignment(null);
      // Refresh assignments
      const data = await getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save assignment");
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-sky-800 border-sky-400 hover:bg-sky-100"
              onClick={() => router.push("/staff/dashboard")}
            >
              ← Return to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-sky-900">Assignments</h1>
          </div>
          <Button
            className="bg-sky-600 hover:bg-sky-700 text-white"
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditingAssignment(null);
            }}
          >
            {showForm ? "Close Form" : "Add New Assignment"}
          </Button>
        </div>

        {/* Assignment Form */}
        {showForm && (
          <Card className="bg-white/50 backdrop-blur-sm border border-sky-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-sky-900">
                {editingAssignment ? "Edit Assignment" : "Create Assignment"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentForm
                initialData={editingAssignment || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAssignment(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        <Card className="bg-white/50 backdrop-blur-sm border border-sky-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-sky-900">Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 mt-2">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-gray-500 mt-2">No assignments available.</p>
            ) : (
              <AssignmentList assignments={assignments} onEdit={handleEdit} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
