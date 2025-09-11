'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Moon, Sun, Bell } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Menu } from '@headlessui/react'
import Link from 'next/link'

export default function StaffNavbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <nav className="w-full flex justify-between items-center bg-white dark:bg-[#0b0f19] px-6 py-3 shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Link href="/staff/dashboard" className="flex items-center">
          <Image src="/eco-mentor-logo.png" alt="Eco-Mentor Logo" width={36} height={36} />
          <span className="font-bold text-lg text-green-600 dark:text-green-400 ml-2">
            Eco-Mentor Staff
          </span>
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Dark Mode Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Profile Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <Image
              src={session?.user?.image || '/default-avatar.png'}
              alt={session?.user?.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session?.user?.name || 'Staff'}
            </span>
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#111827] shadow-lg rounded-md py-1 z-50">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/staff/profile"
                  className={`block w-full px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/staff/settings"
                  className={`block w-full px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  Settings
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm text-red-500 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  onClick={() => signOut({ callbackUrl: '/staff/login' })}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  )
}
