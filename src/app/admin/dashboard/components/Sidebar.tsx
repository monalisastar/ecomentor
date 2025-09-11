'use client'

import Link from 'next/link'
import { Home, Book, Users, DollarSign, Award, Megaphone, Settings } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Courses', href: '/admin/courses', icon: Book },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white/5 backdrop-blur-xl border-r border-white/20 p-6 flex flex-col">
      {/* Brand / Logo */}
      <h1 className="text-xl font-bold mb-8 text-white">🌍 Climate LMS</h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg text-white hover:bg-white/10 transition"
          >
            <Icon size={18} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer (optional) */}
      <div className="text-xs text-white/60 mt-auto">
        © {new Date().getFullYear()} Climate LMS
      </div>
    </aside>
  )
}
