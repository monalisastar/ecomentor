'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  Users,
  FileText,
  BarChart2,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { name: 'Courses', href: '/staff/courses', icon: BookOpen },
  { name: 'Students', href: '/staff/students', icon: Users },
  { name: 'Assignments', href: '/staff/assignments', icon: FileText },
  { name: 'Analytics', href: '/staff/analytics', icon: BarChart2 },
  { name: 'Announcements', href: '/staff/announcements', icon: Bell },
  { name: 'Settings', href: '/staff/settings', icon: Settings },
]

export default function StaffSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login') // redirect to login page after logout
  }

  return (
    <aside className="w-64 bg-white dark:bg-[#0b0f19] min-h-screen border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col p-4">
      {/* Logo */}
      <Link href="/staff/dashboard" className="flex items-center mb-8">
        <img
          src="/eco-mentor-logo.png"
          alt="Eco-Mentor Logo"
          className="w-10 h-10 mr-2"
        />
        <span className="text-green-600 dark:text-green-400 font-bold text-xl">
          Eco-Mentor
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 mb-2 rounded hover:bg-green-100 dark:hover:bg-green-900 transition ${
                isActive
                  ? 'bg-green-200 dark:bg-green-800 font-semibold'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="mr-3" size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center px-3 py-2 mt-4 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 transition"
      >
        <LogOut className="mr-3" size={18} />
        Logout
      </button>
    </aside>
  )
}
