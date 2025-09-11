'use client'

import useSWR, { mutate } from 'swr'
import { useEffect } from 'react'
import { useSocket } from '@/context/SocketProvider'

import StaffNavbar from './components/StaffNavbar'
import StaffSidebar from './components/StaffSidebar'
import OverviewCard from './components/OverviewCard'
import CourseList from './components/CourseList'
import StudentList from './components/StudentList'
import AssignmentPanel from './components/AssignmentPanel'
import AnalyticsChart from './components/AnalyticsChart'
import AnnouncementPanel from './components/AnnouncementPanel'

// Fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function StaffDashboardPage() {
  const { socket } = useSocket() // destructured correctly

  // Initial SWR fetch with fallback to empty arrays
  const { data: studentsData = [] } = useSWR<any[]>('/api/students', fetcher)
  const { data: coursesData = [] } = useSWR<any[]>('/api/courses', fetcher)
  const { data: assignmentsData = [] } = useSWR<any[]>('/api/assignments', fetcher)
  const { data: analyticsData = [] } = useSWR<any[]>('/api/analytics', fetcher)
  const { data: announcementsData = [] } = useSWR<any[]>('/api/announcements', fetcher)

  // 🔔 Realtime socket listeners
  useEffect(() => {
    if (!socket) return

    // Handlers
    const handleStudentCreated = (student: any) => mutate('/api/students', [...(studentsData || []), student], false)
    const handleStudentUpdated = (updated: any) => mutate('/api/students', (data: any[] = []) => data.map(s => s.id === updated.id ? updated : s), false)

    const handleCourseCreated = (course: any) => mutate('/api/courses', [...(coursesData || []), course], false)
    const handleCourseUpdated = (updated: any) => mutate('/api/courses', (data: any[] = []) => data.map(c => c.id === updated.id ? updated : c), false)
    const handleCourseDeleted = (id: string) => mutate('/api/courses', (data: any[] = []) => data.filter(c => c.id !== id), false)

    const handleAssignmentCreated = (assignment: any) => mutate('/api/assignments', [...(assignmentsData || []), assignment], false)
    const handleAssignmentUpdated = (updated: any) => mutate('/api/assignments', (data: any[] = []) => data.map(a => a.id === updated.id ? updated : a), false)

    const handleAnnouncementCreated = (announcement: any) => mutate('/api/announcements', [...(announcementsData || []), announcement], false)
    const handleAnnouncementDeleted = (id: string) => mutate('/api/announcements', (data: any[] = []) => data.filter(a => a.id !== id), false)

    // Register socket events
    socket.on('student:created', handleStudentCreated)
    socket.on('student:updated', handleStudentUpdated)
    socket.on('course:created', handleCourseCreated)
    socket.on('course:updated', handleCourseUpdated)
    socket.on('course:deleted', handleCourseDeleted)
    socket.on('assignment:created', handleAssignmentCreated)
    socket.on('assignment:updated', handleAssignmentUpdated)
    socket.on('announcement:created', handleAnnouncementCreated)
    socket.on('announcement:deleted', handleAnnouncementDeleted)

    // Cleanup
    return () => {
      socket.off('student:created', handleStudentCreated)
      socket.off('student:updated', handleStudentUpdated)
      socket.off('course:created', handleCourseCreated)
      socket.off('course:updated', handleCourseUpdated)
      socket.off('course:deleted', handleCourseDeleted)
      socket.off('assignment:created', handleAssignmentCreated)
      socket.off('assignment:updated', handleAssignmentUpdated)
      socket.off('announcement:created', handleAnnouncementCreated)
      socket.off('announcement:deleted', handleAnnouncementDeleted)
    }
  }, [socket, studentsData, coursesData, assignmentsData, announcementsData])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#e6f3ff] to-[#cce7ff]">
      <StaffSidebar />

      <div className="flex-1 flex flex-col bg-climate-main backdrop-blur-md">
        <StaffNavbar />

        <main className="p-6 space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OverviewCard title="Total Students" value={studentsData?.length || 0} color="climate-accent" />
            <OverviewCard title="Total Courses" value={coursesData?.length || 0} color="climate-accent" />
            <OverviewCard title="Assignments Due" value={assignmentsData?.length || 0} color="climate-accent" />
          </div>

          {/* Courses & Students */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourseList courses={coursesData || []} cardColor="climate-card" accentColor="climate-accent" />
            <StudentList students={studentsData || []} cardColor="climate-card" accentColor="climate-accent" />
          </div>

          {/* Assignments & Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AssignmentPanel
              assignments={assignmentsData || []}
              cardColor="climate-card"
              accentColor="climate-accent"
              onUpdateStatus={async (id, status) => {
                await fetch(`/api/assignments/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status }),
                })
              }}
            />
            <AnalyticsChart data={analyticsData || []} title="Weekly Analytics" interactive />
          </div>

          {/* Announcements */}
          <AnnouncementPanel
            announcements={Array.isArray(announcementsData) ? announcementsData : []}
            cardColor="climate-card"
            accentColor="climate-accent"
            onUpdateStatus={async (id, status) => {
              await fetch(`/api/announcements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
              })
            }}
            onDelete={async (id) => {
              await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
            }}
          />
        </main>
      </div>
    </div>
  )
}
