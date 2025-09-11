"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";

// Dummy student data
const students = [
  {
    id: "S001",
    name: "John Doe",
    email: "john.doe@example.com",
    course: "Carbon developer ",
    year: "3",
    attendance: 92,
    gradeStatus: "A",
    avatar: "https://i.pravatar.cc/50?img=1",
    grades: [
      { subject: "Math", grade: "A" },
      { subject: "CS", grade: "A-" },
      { subject: "Physics", grade: "B+" },
    ],
    attendanceTrend: [90, 92, 95, 88, 92],
  },
  {
    id: "S002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    course: "ghg basics",
    year: "2",
    attendance: 85,
    gradeStatus: "B+",
    avatar: "https://i.pravatar.cc/50?img=2",
    grades: [
      { subject: "Math", grade: "B+" },
      { subject: "CS", grade: "B" },
      { subject: "Physics", grade: "A-" },
    ],
    attendanceTrend: [80, 85, 87, 83, 85],
  },
  // Add more students as needed
];

export default function StaffStudentsPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cce7ff] to-[#e6f3ff] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Students</h1>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/staff/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Courses</h3>
            <p className="text-2xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Low Attendance</h3>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Recent Enrollments</h3>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input placeholder="Search by name or ID" className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800" />
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg shadow-md">
          <thead>
            <tr className="text-left border-b border-white/40">
              <th className="px-4 py-2">Avatar</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Year</th>
              <th className="px-4 py-2">Attendance %</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <>
                <tr
                  key={student.id}
                  className="hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => setExpandedRow(expandedRow === student.id ? null : student.id)}
                >
                  <td className="px-4 py-2">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.id}</td>
                  <td className="px-4 py-2">{student.email}</td>
                  <td className="px-4 py-2">{student.course}</td>
                  <td className="px-4 py-2">{student.year}</td>
                  <td className="px-4 py-2">{student.attendance}%</td>
                  <td className="px-4 py-2">{student.gradeStatus}</td>
                  <td className="px-4 py-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-lg">
                        <DialogTitle className="text-xl font-bold mb-4">
                          {selectedStudent?.name} Profile
                        </DialogTitle>
                        {selectedStudent && (
                          <div className="space-y-2 text-gray-800">
                            <p><strong>ID:</strong> {selectedStudent.id}</p>
                            <p><strong>Email:</strong> {selectedStudent.email}</p>
                            <p><strong>Course:</strong> {selectedStudent.course}</p>
                            <p><strong>Year:</strong> {selectedStudent.year}</p>
                            <p><strong>Attendance:</strong> {selectedStudent.attendance}%</p>
                            <p><strong>Grade:</strong> {selectedStudent.gradeStatus}</p>
                          </div>
                        )}
                        <div className="mt-6 flex justify-end">
                          <Button onClick={() => setSelectedStudent(null)}>Close</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>

                {/* Expandable Row */}
                <AnimatePresence>
                  {expandedRow === student.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/10"
                    >
                      <td colSpan={9} className="px-4 py-4">
                        <div className="backdrop-blur-lg bg-white/20 border border-white/40 rounded-lg p-4 shadow-inner">
                          <h4 className="text-lg font-semibold mb-2">Grades</h4>
                          <ul className="mb-4">
                            {student.grades.map((g) => (
                              <li key={g.subject}>
                                {g.subject}: {g.grade}
                              </li>
                            ))}
                          </ul>
                          <h4 className="text-lg font-semibold mb-2">Attendance Trend</h4>
                          <div className="flex space-x-2">
                            {student.attendanceTrend.map((att, idx) => (
                              <div
                                key={idx}
                                className="flex-1 h-4 bg-blue-500 rounded"
                                style={{ width: `${att}%` }}
                                title={`${att}%`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
