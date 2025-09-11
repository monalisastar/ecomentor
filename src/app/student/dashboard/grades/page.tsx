"use client"

import { useEffect, useState, useMemo } from "react"
import { useSocket } from "@/context/SocketProvider"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Grade {
  id: string
  assignment: string
  grade: number
  status: string
  feedback: string
  date: string
  subject: string
}

export default function ClimateGradesPage({ studentId }: { studentId: string }) {
  const { socket } = useSocket()
  const [grades, setGrades] = useState<Grade[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<"date" | "grade">("date")

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id)

  const fetchGrades = async () => {
    const res = await fetch("/api/student/grades")
    const data = await res.json()
    setGrades(data.grades)
  }

  useEffect(() => {
    fetchGrades()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.emit("join-room", `student-${studentId}`)

    socket.on("grades-update", (updatedGrade: Grade) => {
      setGrades((prev) =>
        prev.map((g) => (g.id === updatedGrade.id ? updatedGrade : g))
      )
    })

    return () => socket.off("grades-update")
  }, [socket])

  // Filter & sort
  const filteredGrades = useMemo(() => {
    return grades
      .filter((g) => g.assignment.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortKey === "date"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : b.grade - a.grade
      )
  }, [grades, search, sortKey])

  // Calculate GPA / Average grade
  const averageGrade = useMemo(() => {
    if (grades.length === 0) return 0
    const total = grades.reduce((sum, g) => sum + g.grade, 0)
    return Math.round(total / grades.length)
  }, [grades])

  // Per-subject progress
  const subjectProgress = useMemo(() => {
    const subjects: Record<string, { total: number; count: number }> = {}
    grades.forEach((g) => {
      if (!subjects[g.subject]) subjects[g.subject] = { total: 0, count: 0 }
      subjects[g.subject].total += g.grade
      subjects[g.subject].count += 1
    })
    const result: { subject: string; average: number }[] = []
    for (const subj in subjects) {
      result.push({ subject: subj, average: Math.round(subjects[subj].total / subjects[subj].count) })
    }
    return result
  }, [grades])

  // Prepare chart data
  const chartData = useMemo(() => {
    const sorted = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return {
      labels: sorted.map((g) => g.assignment),
      datasets: [
        {
          label: "Grades Over Time",
          data: sorted.map((g) => g.grade),
          fill: false,
          borderColor: "#16A34A",
          backgroundColor: "#4ADE80",
          tension: 0.3,
        },
      ],
    }
  }, [grades])

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" as const } },
    scales: { y: { beginAtZero: true, max: 100 } },
  }

  const gradeColor = (g: number) => {
    if (g >= 85) return "text-green-600"
    if (g >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-green-200 to-green-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-green-900 text-3xl font-bold mb-6 text-center"> grade Dashboard</h1>

        {/* GPA / Average Grade Card */}
        <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-md text-center">
          <h2 className="text-lg md:text-xl font-semibold text-green-900 mb-2">Average Grade</h2>
          <p className="text-3xl font-bold text-green-700">{averageGrade}%</p>
        </div>

        {/* Per-Subject Progress Bars */}
        <div className="mb-6 space-y-4">
          {subjectProgress.map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between mb-1">
                <span className="text-green-900 font-medium">{s.subject}</span>
                <span className="text-green-700 font-semibold">{s.average}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: `${s.average}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as "date" | "grade")}
            className="p-2 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="date">Sort by Date</option>
            <option value="grade">Sort by Grade</option>
          </select>
        </div>

        {/* Grade Trend Chart */}
        {grades.length > 0 && (
          <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-md">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Grades List */}
        <div className="space-y-4">
          {filteredGrades.map((g) => (
            <motion.div
              key={g.id}
              className="bg-white/30 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-300"
              layout
              onClick={() => toggleExpand(g.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-green-900">{g.assignment}</h2>
                  <p className="text-green-700 mt-1 text-sm md:text-base">
                    Grade: <span className={`${gradeColor(g.grade)} font-medium`}>{g.grade}</span> | Status: <span className="font-medium">{g.status}</span>
                  </p>
                  <p className="text-green-600 text-xs md:text-sm mt-1">{new Date(g.date).toLocaleDateString()}</p>
                  <p className="text-green-700 text-xs md:text-sm mt-1">Subject: {g.subject}</p>
                </div>
                <div className="text-green-900 text-lg md:text-xl">{expanded === g.id ? <FaChevronUp /> : <FaChevronDown />}</div>
              </div>

              <AnimatePresence>
                {expanded === g.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-green-800 border-t border-white/30 pt-4 text-sm md:text-base leading-relaxed"
                  >
                    {g.feedback || "No feedback yet."}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {filteredGrades.length === 0 && (
            <p className="text-green-700 text-center mt-8">No assignments match your search.</p>
          )}
        </div>
      </div>
    </div>
  )
}
