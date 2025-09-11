'use client'

import { Bell, Search } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="w-full h-16 flex items-center justify-between px-6 border-b border-white/20 bg-white/5 backdrop-blur-xl">
      {/* Search Bar */}
      <div className="relative w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
        <input
          type="text"
          placeholder="Search courses, users..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-white/10 transition">
          <Bell className="text-white" size={20} />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded-full">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/images/admin-avatar.png"
            alt="Admin"
            className="w-8 h-8 rounded-full border border-white/20"
          />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  )
}
