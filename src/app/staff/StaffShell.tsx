'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

export default function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  const staffName = session?.user?.name || 'Staff Member'
  const staffImage = session?.user?.image || null

  const navItems = [
    { name: 'Overview', href: '/staff/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Courses', href: '/staff/courses', icon: <BookOpen size={16} /> },
    { name: 'Students', href: '/staff/students', icon: <Users size={16} /> },
    { name: 'Certificates', href: '/staff/certificates', icon: <Award size={16} /> },
    { name: 'Settings', href: '/staff/settings', icon: <Settings size={16} /> },
  ]

  const handleLogout = async () => {
    await signOut({ redirect: false })
    localStorage.removeItem('eco_mentor_role')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <img src="/eco-mentor-logo.webp" alt="Eco-Mentor Logo" className="w-8 h-8 rounded-md" />
          <h1 className="font-bold text-lg text-green-700">Eco-Mentor Staff</h1>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Top bar */}
      <header className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 py-3 h-16">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center text-gray-700 hover:text-green-700 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-4 ml-auto">
          {staffImage ? (
            <img src={staffImage} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
              {staffName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{staffName}</span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-20 md:pt-6 p-6 overflow-y-auto">{children}</main>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}
