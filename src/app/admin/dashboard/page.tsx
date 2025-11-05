'use client'

import StatsGrid from './components/StatsGrid'
import ChartSection from './components/ChartSection'
import ActivityFeed from './components/ActivityFeed'
import ReviewPanel from './components/ReviewPanel'
import SystemAlerts from './components/SystemAlerts'

export default function AdminDashboardPage() {
  return (
    <main className="space-y-10">
      {/* 🌿 Header */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-green-700">Admin</span> 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Manage Eco-Mentor’s performance, analytics, and overall platform
          health from a single dashboard.
        </p>
      </section>

      {/* 📊 Key Stats Overview */}
      <StatsGrid />

      {/* 📈 Analytics Charts */}
      <ChartSection />

      {/* 🧾 Recent Platform Activity */}
      <ActivityFeed />

      {/* 🧠 Course Moderation */}
      <ReviewPanel />

      {/* ⚠️ System Alerts */}
      <SystemAlerts />
    </main>
  )
}
