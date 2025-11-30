'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  GraduationCap,
  User,
  PlayCircle,
  Award,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { api } from '@/lib/api';

// ⚡ SWR fetcher
const fetcher = (url: string) => api.get(url);

// ⚙️ LocalStorage-based cache provider
function localStorageProvider() {
  if (typeof window === 'undefined') return new Map();

  const map = new Map<string, any>(
    JSON.parse(localStorage.getItem('eco-mentor-cache') || '[]')
  );

  // 🧹 Save cache before unload
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('eco-mentor-cache', appCache);
  });

  return map;
}

// ✅ Navigation items
const navItems = [
  { name: 'Home', href: '/student/dashboard', icon: <GraduationCap size={16} /> },
  { name: 'Courses', href: '/student/courses', icon: <BookOpen size={16} /> },
  { name: 'My Learning', href: '/student/my-learning', icon: <PlayCircle size={16} /> },
  { name: 'Certifications', href: '/student/certifications', icon: <Award size={16} /> },
  { name: 'Profile', href: '/student/profile', icon: <User size={16} /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // 🧠 Persist SWR cache provider initialization
  const [providerReady, setProviderReady] = useState(false);
  useEffect(() => setProviderReady(true), []);

  return (
    providerReady && (
      <SWRConfig
        value={{
          fetcher,
          provider: localStorageProvider,
          revalidateOnFocus: true,
          dedupingInterval: 60000, // 1 min
          shouldRetryOnError: false,
        }}
      >
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* 🌿 Navbar */}
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
              {/* Logo */}
              <Link href="/student/dashboard" className="flex items-center gap-2">
                <img
                  src="/eco-mentor-logo.webp"
                  alt="Eco-Mentor Logo"
                  className="w-8 h-8 rounded-md"
                />
                <span className="font-bold text-xl text-green-700">Eco-Mentor</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex gap-6 items-center">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      pathname === item.href
                        ? 'bg-green-100 text-green-700 font-semibold'
                        : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}

                {/* Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 border border-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center text-gray-700 hover:text-green-700 transition"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </nav>

            {/* Mobile Navigation */}
            {menuOpen && (
              <div className="md:hidden bg-white border-t border-gray-200 shadow-inner">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 border-b text-sm transition ${
                      pathname === item.href
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center gap-3 w-full px-6 py-3 text-left text-sm text-red-600 border-t hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </header>

          {/* 🧠 Main Page Content */}
          <main className="flex-1">{children}</main>

          {/* 🌍 Footer */}
          <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} Eco-Mentor Academy · Empowering Climate Education
          </footer>
        </div>
      </SWRConfig>
    )
  );
}
