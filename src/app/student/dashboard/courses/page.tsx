"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/context/SocketProvider"

import StatsPanel, { Stat } from "@/components/StatsPanel"
import SearchBar from "@/components/SearchBar"
import LecturersMarquee, { Lecturer } from "@/components/LecturersMarquee"
import Leaderboard, { LeaderboardEntry } from "@/components/Leaderboard"
import CourseGrid from "@/components/CourseGrid"
import CertificatesShowcase, { Certificate } from "@/components/CertificatesShowcase"
import ActivityHeatmap, { ActivityPoint } from "@/components/ActivityHeatmap"

import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Course = {
  _id: string
  title: string
  description: string
  enrollments: number
  rating: number
  createdAt: string
  popular: boolean
  recommended: boolean
  isNew: boolean
  enrolled?: boolean // 🔹 Track if student is enrolled
}

// 🔹 API helper for enrollment
async function enrollInCourse(courseId: string) {
  const res = await fetch("/api/student/courses/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  })
  if (!res.ok) throw new Error("Enrollment failed")
  return res.json()
}

export default function CoursesDashboardPage() {
  const { data: session } = useSession()
  const socket = useSocket()

  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [activityData, setActivityData] = useState<ActivityPoint[]>([])

  // 🔹 Initial fetch
  useEffect(() => {
    async function fetchData() {
      const [coursesRes, statsRes, lecturersRes, leaderboardRes, certRes, activityRes] = await Promise.all([
        fetch("/api/student/courses"),
        fetch("/api/student/stats"),
        fetch("/api/student/lecturers"),
        fetch("/api/student/leaderboard"),
        fetch("/api/student/certificates"),
        fetch("/api/student/activity")
      ])
      const coursesData: Course[] = await coursesRes.json()
      setCourses(coursesData)
      setStats(await statsRes.json())
      setLecturers(await lecturersRes.json())
      setLeaderboard(await leaderboardRes.json())
      setCertificates(await certRes.json())
      setActivityData(await activityRes.json())
    }
    fetchData()
  }, [])

  // 🔹 WebSocket listeners
  useEffect(() => {
    if (!socket || !session?.user?.id) return
    socket.emit("join-room", `student-${session.user.id}`)

    socket.on("course-updated", (updatedCourse: Course) => {
      setCourses(prev => prev.map(c => (c._id === updatedCourse._id ? updatedCourse : c)))
    })
    socket.on("new-course", (newCourse: Course) => {
      setCourses(prev => [newCourse, ...prev])
    })
    socket.on("leaderboard-updated", setLeaderboard)
    socket.on("certificates-updated", setCertificates)
    socket.on("activity-updated", setActivityData)
    socket.on("stats-updated", setStats)

    return () => {
      socket.off("course-updated")
      socket.off("new-course")
      socket.off("leaderboard-updated")
      socket.off("certificates-updated")
      socket.off("activity-updated")
      socket.off("stats-updated")
    }
  }, [socket, session?.user?.id])

  // 🔹 Enroll handler
  const handleEnroll = async (courseId: string) => {
    try {
      const updatedCourse = await enrollInCourse(courseId)
      setCourses(prev =>
        prev.map(c =>
          c._id === updatedCourse._id ? { ...updatedCourse, enrolled: true } : c
        )
      )
    } catch (error) {
      console.error(error)
      alert("Failed to enroll. Please try again.")
    }
  }

  // 🔹 Filter + Sort
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
    )
    if (activeTab === "popular") filtered = filtered.filter(c => c.popular)
    if (activeTab === "new") filtered = filtered.filter(c => c.isNew)
    if (activeTab === "recommended") filtered = filtered.filter(c => c.recommended)

    if (sortBy === "newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sortBy === "popular") filtered = [...filtered].sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0))
    if (sortBy === "rating") filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return filtered
  }, [courses, query, activeTab, sortBy])

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-12 px-8 rounded-b-3xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {session?.user?.name || "Student"}
            </h1>
            <p className="text-lg opacity-90">
              Keep learning and growing your expertise in climate action
            </p>
          </div>
          <Button className="bg-white text-emerald-700 hover:bg-gray-100 shadow-lg" size="lg">
            <TrendingUp className="mr-2 h-5 w-5" /> View Progress
          </Button>
        </div>
      </section>

      {/* Content */}
      <div className="p-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchBar query={query} setQuery={setQuery} />
          </div>
          <div className="lg:col-span-3">
            <StatsPanel stats={stats} className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <Card className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Explore Courses</CardTitle>
                <div className="flex items-center gap-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="popular">Popular</TabsTrigger>
                      <TabsTrigger value="new">New</TabsTrigger>
                      <TabsTrigger value="recommended">Recommended</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <CourseGrid
                  query={query}
                  courses={filteredCourses}
                  onEnroll={handleEnroll} // 🔹 Pass handler
                />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
            <div className="sticky top-0 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50 mb-4"
              >
                ← Go Back to Dashboard
              </Button>
            </div>

            <Leaderboard entries={leaderboard} className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl" />
            <LecturersMarquee lecturers={lecturers} className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl" />
            <CertificatesShowcase certificates={certificates} className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl" />
          </aside>
        </div>

        <Card className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Learning Activity</CardTitle>
            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">
              Export Data
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap data={activityData} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
