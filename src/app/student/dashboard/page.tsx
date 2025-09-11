'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

import CourseGrid from '@/components/CourseGrid'
import CertificatesShowcase, { Certificate } from '@/components/CertificatesShowcase'
import Leaderboard, { LeaderboardEntry } from '@/components/Leaderboard'
import ActivityHeatmap, { ActivityPoint } from '@/components/ActivityHeatmap'
import { enhancedCourses, EnhancedCourse } from '@/data/enhancedCourseData'
import { Button } from '@/components/ui/button'
import ECOAssistant from '@/components/ECOAssistant'

/** Mock Data */

// Weekly progress for FLR or learning points
const mockFLRData = [
  { day: 'Mon', score: 10 },
  { day: 'Tue', score: 40 },
  { day: 'Wed', score: 60 },
  { day: 'Thu', score: 80 },
  { day: 'Fri', score: 100 },
]

// Activity Heatmap
const mockActivityData: ActivityPoint[] = [
  { day: 'Mon', hour: 9, value: 5 },
  { day: 'Tue', hour: 11, value: 8 },
  { day: 'Wed', hour: 14, value: 12 },
  { day: 'Thu', hour: 16, value: 6 },
  { day: 'Fri', hour: 10, value: 9 },
  { day: 'Sat', hour: 13, value: 7 },
  { day: 'Sun', hour: 18, value: 11 },
]

// Certificates
const mockCertificates: Certificate[] = [
  { id: 1, title: 'GHG Accounting Pro', image: '/cert-ghg.jpg' },
  { id: 2, title: 'Carbon Management Expert', image: '/cert-carbon.jpg' },
  { id: 3, title: 'MRV Specialist', image: '/cert-mrv.jpg' },
  { id: 4, title: 'Climate Policy Analyst', image: '/cert-policy.jpg' },
]

// Leaderboard
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alice Johnson', score: 980 },
  { rank: 2, name: 'Bob Smith', score: 950 },
  { rank: 3, name: 'Charlie Brown', score: 920 },
  { rank: 4, name: 'David Wilson', score: 890 },
  { rank: 5, name: 'Eve Davis', score: 870 },
]

// Assignments
const mockAssignments = [
  { id: 1, title: 'Carbon Accounting Report', due: '2025-09-10', status: 'Pending' },
  { id: 2, title: 'Climate Policy Analysis', due: '2025-09-12', status: 'Submitted' },
  { id: 3, title: 'GHG Reduction Plan', due: '2025-09-15', status: 'Graded' },
]

// Announcements
const mockAnnouncements = [
  { id: 1, title: 'New Module Released: Carbon Markets', date: '2025-09-01' },
  { id: 2, title: 'Live Webinar on Climate Finance', date: '2025-09-03' },
  { id: 3, title: 'Assignment 2 Deadline Extended', date: '2025-09-04' },
]

// Grades Preview
const mockGrades = [
  { course: 'GHG Accounting', grade: 'A', feedback: 'Excellent work!' },
  { course: 'Climate Policy', grade: 'B+', feedback: 'Good effort, improve references.' },
  { course: 'Carbon Management', grade: 'A-', feedback: 'Well done!' },
]

// Calendar Events
const mockCalendarEvents = [
  { date: '2025-09-08', title: 'Live Lecture: Climate Mitigation' },
  { date: '2025-09-10', title: 'Assignment Due: Carbon Accounting' },
  { date: '2025-09-12', title: 'Webinar: Renewable Energy Finance' },
]

/** Components */

// Recommendation Carousel
function RecommendationCarousel({ courses }: { courses: EnhancedCourse[] }) {
  return (
    <div className="overflow-x-auto py-4">
      <motion.div className="flex gap-6" drag="x" dragConstraints={{ left: -500, right: 0 }}>
        {courses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.05 }}
            className="min-w-[220px] bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg flex-shrink-0"
          >
            <h4 className="font-semibold mb-2 text-white">{course.title}</h4>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{course.description}</p>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${course.progress || 50}%` }}
              />
            </div>

            <Button className="bg-green-500 hover:bg-green-600 w-full py-2 mt-2 font-semibold text-white">
              Continue
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// Assignment Card
function AssignmentCard({ assignment }: { assignment: typeof mockAssignments[0] }) {
  const statusColor =
    assignment.status === 'Pending'
      ? 'text-yellow-400'
      : assignment.status === 'Submitted'
      ? 'text-blue-400'
      : 'text-green-400'
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-md">
      <h4 className="font-semibold text-white">{assignment.title}</h4>
      <p className="text-gray-300 text-sm">Due: {assignment.due}</p>
      <p className={`${statusColor} font-semibold mt-1`}>{assignment.status}</p>
    </motion.div>
  )
}

// Announcement Card
function AnnouncementCard({ announcement }: { announcement: typeof mockAnnouncements[0] }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/20 backdrop-blur-md p-4 rounded-xl shadow-sm">
      <h4 className="font-semibold text-white">{announcement.title}</h4>
      <p className="text-gray-300 text-sm">{announcement.date}</p>
    </motion.div>
  )
}

// Grade Card
function GradeCard({ grade }: { grade: typeof mockGrades[0] }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-md">
      <h4 className="font-semibold text-white">{grade.course}</h4>
      <p className="text-green-400 font-bold text-lg">{grade.grade}</p>
      <p className="text-gray-300 text-sm">{grade.feedback}</p>
    </motion.div>
  )
}

// Calendar Event Card
function CalendarEventCard({ event }: { event: typeof mockCalendarEvents[0] }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-md mb-2">
      <p className="text-white font-semibold">{event.date}</p>
      <p className="text-gray-300 text-sm">{event.title}</p>
    </motion.div>
  )
}

/** Dashboard Page */
export default function DashboardPage() {
  const { data: session } = useSession()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const name = session?.user?.name || 'Dev User'

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] text-white px-6 md:px-16 py-20 space-y-16 overflow-x-hidden">
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition text-sm"
        >
          Toggle {isDark ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Top Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex flex-wrap justify-center gap-4 mb-12"
      >
        <Link href="/student/dashboard/courses">
          <Button className="bg-green-500 hover:bg-green-600 px-4 py-2 font-semibold">Courses</Button>
        </Link>

        <Link href="/student/dashboard/assignments">
          <Button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 font-semibold">Assignments</Button>
        </Link>

        <Link href="/student/dashboard/active-courses">
          <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold">Active Courses</Button>
        </Link>

        <Link href="/student/dashboard/grades">
          <Button className="bg-purple-500 hover:bg-purple-600 px-4 py-2 font-semibold">Grades & Feedback</Button>
        </Link>

        <Link href="/student/dashboard/recommendations">
          <Button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 font-semibold">Recommendations</Button>
        </Link>

        <Link href="/student/dashboard/announcements">
          <Button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 font-semibold">Announcements</Button>
        </Link>

        <Link href="/student/dashboard/certificates">
          <Button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 font-semibold">Certificates</Button>
        </Link>

        <Link href="/student/dashboard/aera">
          <Button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 font-semibold">AERA Wallet</Button>
        </Link>

        <Link href="/student/dashboard/profile">
          <Button className="bg-gray-500 hover:bg-gray-600 px-4 py-2 font-semibold">Profile</Button>
        </Link>

        <Link href="/student/dashboard/settings">
          <Button className="bg-gray-700 hover:bg-gray-800 px-4 py-2 font-semibold">Settings</Button>
        </Link>

        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-semibold"
        >
          Logout
        </button>
      </motion.nav>

      {/* Welcome Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold">Welcome back, {name} 👋</h1>
        <p className="text-gray-300 text-lg">Here's your climate learning journey at a glance.</p>
      </motion.section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-400 mb-1">Enrolled Courses</p>
          <h3 className="text-2xl font-semibold">6</h3>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-400 mb-1">Completed Lessons</p>
          <h3 className="text-2xl font-semibold">24</h3>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-400 mb-1">Pending Assignments</p>
          <h3 className="text-2xl font-semibold">3</h3>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-400 mb-1">Referral Points</p>
          <h3 className="text-2xl font-semibold">120</h3>
        </motion.div>
      </div>

      {/* Active Courses */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10 space-y-6">
        <h2 className="text-2xl font-bold text-green-400">Your Active Courses</h2>
        <CourseGrid courses={enhancedCourses.slice(0, 6)} query="" />
      </motion.section>

      {/* Assignments */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </motion.section>

      {/* Recommendations Carousel */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Recommended for You</h2>
        <RecommendationCarousel courses={enhancedCourses.slice(6, 12)} />
      </motion.section>

      {/* Announcements */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Announcements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockAnnouncements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </motion.section>

      {/* Grades Preview */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Grades & Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockGrades.map((g, i) => (
            <GradeCard key={i} grade={g} />
          ))}
        </div>
      </motion.section>

      {/* Calendar / Schedule */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Calendar / Schedule</h2>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
          {mockCalendarEvents.map((e, i) => (
            <CalendarEventCard key={i} event={e} />
          ))}
        </div>
      </motion.section>

      {/* FLR Progress Chart */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl max-w-5xl mx-auto relative z-10">
        <h2 className="text-lg font-semibold text-white mb-4">Your Progress This Week</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={mockFLRData}>
            <XAxis dataKey="day" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.section>

      {/* Activity Heatmap */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl max-w-5xl mx-auto relative z-10">
        <h2 className="text-lg font-semibold text-white mb-4">Learning Activity</h2>
        <ActivityHeatmap data={mockActivityData} />
      </motion.section>

      {/* Leaderboard */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }} className="relative z-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Leaderboard</h2>
        <Leaderboard entries={mockLeaderboard} />
      </motion.section>

      {/* Explore More Courses CTA */}
      <div className="text-center pt-12 relative z-10">
        <Link href="/courses">
          <button className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-full font-semibold transition inline-flex items-center gap-3 text-lg">
            Explore More Courses <ArrowRight size={20} />
          </button>
        </Link>
      </div>

      {/* Floating ECO Assistant */}
      <ECOAssistant />
    </main>
  )
}
