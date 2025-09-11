'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type RoleOption = 'Student' | 'Lecturer' | 'Staff' | 'Admin'

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState('Eco Mentor LMS')
  const [theme, setTheme] = useState('Dark')
  const [defaultRole, setDefaultRole] = useState<RoleOption>('Student')
  const [accessLogsEnabled, setAccessLogsEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white space-y-6">
      {/* Top */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link href="/admin" className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          Return to Dashboard
        </Link>
      </div>

      {/* Settings Panel */}
      <div className="space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl">
        {/* Platform Name */}
        <div className="flex flex-col">
          <label className="mb-1 text-white font-semibold">Platform Name</label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
          />
        </div>

        {/* Theme Selection */}
        <div className="flex flex-col">
          <label className="mb-1 text-white font-semibold">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none appearance-none"
          >
            <option value="Dark">Dark</option>
            <option value="Light">Light</option>
            <option value="System">System</option>
          </select>
        </div>

        {/* Default Role */}
        <div className="flex flex-col">
          <label className="mb-1 text-white font-semibold">Default Role for New Users</label>
          <select
            value={defaultRole}
            onChange={(e) => setDefaultRole(e.target.value as RoleOption)}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none appearance-none"
          >
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Access Logs Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">Enable Access Logs</span>
          <input
            type="checkbox"
            checked={accessLogsEnabled}
            onChange={(e) => setAccessLogsEnabled(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
