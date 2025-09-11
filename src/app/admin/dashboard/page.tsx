'use client'

import useSWR from 'swr'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardCards from './components/DashboardCards'
import RecentCoursesTable from './components/RecentCoursesTable'
import RecentPaymentsTable from './components/RecentPaymentsTable'
import UserManagementTable from './components/UserManagementTable'
import CertificatesManager from './components/CertificatesManager'
import PaymentsManager from './components/PaymentsManager'
import AnnouncementsManager from './components/AnnouncementsManager'
import SettingsPanel from './components/SettingsPanel'
import AnalyticsChart from './components/AnalyticsChart'

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminDashboardPage() {
  // Fetch live data from APIs
  const { data: coursesData, isLoading: loadingCourses } = useSWR('/api/courses', fetcher, { fallbackData: [] })
  const { data: paymentsData, isLoading: loadingPayments } = useSWR('/api/payments', fetcher, { fallbackData: [] })
  const { data: usersData, isLoading: loadingUsers } = useSWR('/api/users', fetcher, { fallbackData: [] })
  const { data: certificatesData, isLoading: loadingCertificates } = useSWR('/api/certificates', fetcher, { fallbackData: [] })
  const { data: analyticsData, isLoading: loadingAnalytics } = useSWR('/api/analytics', fetcher, { fallbackData: [] })

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Topbar */}
        <Topbar />

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <DashboardCards
            courses={coursesData}
            payments={paymentsData}
            users={usersData}
            certificates={certificatesData}
            loading={loadingCourses || loadingPayments || loadingUsers || loadingCertificates}
          />

          {/* Analytics */}
          <AnalyticsChart data={analyticsData} loading={loadingAnalytics} title="Admin Analytics" />

          {/* Recent Courses + Payments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentCoursesTable courses={coursesData} loading={loadingCourses} />
            <RecentPaymentsTable payments={paymentsData} loading={loadingPayments} />
          </div>

          {/* User Management */}
          <UserManagementTable users={usersData} loading={loadingUsers} />

          {/* Certificates + Payments Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CertificatesManager certificates={certificatesData} loading={loadingCertificates} />
            <PaymentsManager payments={paymentsData} loading={loadingPayments} />
          </div>

          {/* Announcements */}
          <AnnouncementsManager />

          {/* Settings */}
          <SettingsPanel />
        </main>
      </div>
    </div>
  )
}
