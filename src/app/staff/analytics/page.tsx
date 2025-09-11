"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler } from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dummy data
const courses = ["All Courses", "Computer Science", "Mathematics", "Physics"];
const students = [
  { id: "S001", name: "John Doe", course: "Computer Science", attendance: 92, grade: 3.8 },
  { id: "S002", name: "Jane Smith", course: "Mathematics", attendance: 78, grade: 2.9 },
  { id: "S003", name: "Alice Johnson", course: "Physics", attendance: 85, grade: 3.2 },
];

const attendanceData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  datasets: [
    {
      label: "Attendance %",
      data: [85, 90, 88, 92, 87],
      fill: true,
      backgroundColor: "rgba(102, 159, 255, 0.3)",
      borderColor: "rgba(102, 159, 255, 1)",
      tension: 0.3,
    },
  ],
};

const gradesData = {
  labels: ["A", "B", "C", "D", "F"],
  datasets: [
    {
      label: "Number of Students",
      data: [30, 50, 25, 10, 5],
      backgroundColor: "rgba(102, 159, 255, 0.7)",
    },
  ],
};

export default function StaffAnalyticsPage() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      (selectedCourse === "All Courses" || s.course === selectedCourse) &&
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const atRiskStudents = filteredStudents.filter(
    (s) => s.attendance < 80 || s.grade < 3
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cce7ff] to-[#e6f3ff] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/staff/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Search student..."
          className="backdrop-blur-lg bg-white/20 border border-white/30 text-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64 backdrop-blur-lg bg-white/20 border border-white/30">
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-2xl font-bold">{filteredStudents.length}</p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Average Attendance</h3>
            <p className="text-2xl font-bold">
              {filteredStudents.length > 0
                ? Math.round(
                    filteredStudents.reduce((sum, s) => sum + s.attendance, 0) /
                      filteredStudents.length
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">Average Grade</h3>
            <p className="text-2xl font-bold">
              {filteredStudents.length > 0
                ? (
                    filteredStudents.reduce((sum, s) => sum + s.grade, 0) /
                    filteredStudents.length
                  ).toFixed(2)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance & Grades Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Attendance Over Weeks</h2>
          <Line data={attendanceData} />
        </div>
        <div className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Grade Distribution</h2>
          <Bar data={gradesData} />
        </div>
      </div>

      {/* Student-Specific Analytics */}
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-lg p-4 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Student-Specific Analytics</h2>
        {selectedStudent ? (
          <div className="text-gray-800 space-y-2">
            <p>
              <strong>Name:</strong>{" "}
              {students.find((s) => s.id === selectedStudent)?.name}
            </p>
            <p>
              <strong>Course:</strong>{" "}
              {students.find((s) => s.id === selectedStudent)?.course}
            </p>
            <p>
              <strong>Attendance:</strong>{" "}
              {students.find((s) => s.id === selectedStudent)?.attendance}%
            </p>
            <p>
              <strong>Grade:</strong>{" "}
              {students.find((s) => s.id === selectedStudent)?.grade}
            </p>
            <Button onClick={() => setSelectedStudent(null)}>Clear Selection</Button>
          </div>
        ) : (
          <ul className="space-y-2 text-gray-800">
            {filteredStudents.map((s) => (
              <li
                key={s.id}
                className="flex justify-between p-2 bg-white/20 rounded cursor-pointer hover:bg-white/30"
                onClick={() => setSelectedStudent(s.id)}
              >
                <span>{s.name}</span>
                <span>
                  Attendance: {s.attendance}% | Grade: {s.grade.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* At-Risk Students Table */}
      <div className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">At-Risk Students</h2>
        {atRiskStudents.length === 0 ? (
          <p className="text-gray-800">No at-risk students found.</p>
        ) : (
          <table className="min-w-full text-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Course</th>
                <th className="px-4 py-2 text-left">Attendance %</th>
                <th className="px-4 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {atRiskStudents.map((s) => (
                <tr key={s.id} className="border-t border-white/30">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.course}</td>
                  <td className="px-4 py-2">{s.attendance}%</td>
                  <td className="px-4 py-2">{s.grade.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
