'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Settings,
  LogOut,
  ShieldCheck,
  FileText, // 🆕 Added icon for CMS
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/staff', label: 'Staff', icon: Users },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/certificates', label: 'Certificates', icon: Award },

    // 🧩 New CMS Manager link
    { href: '/admin/cms', label: 'Manage CMS', icon: FileText },

    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🌿 Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-green-900 text-white p-5 transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/admin/dashboard"
            className="text-2xl font-extrabold tracking-tight"
          >
            <span className="text-white">Eco-Mentor</span>
            <span className="text-yellow-400"> Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-gray-200 hover:bg-green-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-0 w-full px-5">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 w-full justify-center py-2 rounded-lg bg-green-700 hover:bg-green-600 transition text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* 📱 Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded-lg shadow-md"
      >
        ☰
      </button>

      {/* 🧭 Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* 🔝 Top Navbar */}
        <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-700" size={20} />
            <h1 className="text-lg font-semibold text-gray-800">
              Admin Control Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              A
            </div>
          </div>
        </header>

        {/* 🌍 Page Body */}
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
