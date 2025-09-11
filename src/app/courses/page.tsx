'use client'

import { useState } from 'react'


import { courseData } from '@/data/courseData'



import { AnimatePresence, motion } from 'framer-motion'

export default function CoursesPage() {
  const categories = [
    { key: 'all', label: 'All Courses' },
    { key: 'foundational', label: 'Foundational' },
    { key: 'diplomas', label: 'Professional Diplomas' },
    { key: 'project', label: 'Carbon Projects & Technology' },
    { key: 'sectoral', label: 'Sectoral Scopes' },
  ]
  const [active, setActive] = useState('all')
  const [search, setSearch] = useState('')

  const groups = {
    foundational: courseData.filter(c =>
      ['climate-intro', 'carbon-frameworks', 'ghg-basics', 'carbon-developer'].includes(c.slug)
    ),
    diplomas: courseData.filter(c =>
      ['ghg-accounting', 'carbon-management', 'ghg-mrv'].includes(c.slug)
    ),
    project: courseData.filter(c =>
      ['carbon-projects', 'validation', 'verification', 'digital-mrv', 'climate-policy'].includes(c.slug)
    ),
    sectoral: courseData.filter(c => c.slug.startsWith('scope-')),
  }

  const displayedRaw =
    active === 'all' ? courseData : groups[active as keyof typeof groups] || []

  const displayed = displayedRaw.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] text-white px-6 py-20 md:px-12">
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-12">

        {/* Hero Heading */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Learn Carbon Accounting. Lead the Future.
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore foundational, professional, and sector-specific courses that prepare you for climate leadership.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-full w-full max-w-md text-black bg-white/90 placeholder-gray-500"
          />
        </div>

        {/* Filter Tabs */}
        <nav className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                active === cat.key
                  ? 'bg-green-500 text-white shadow-md scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active + search}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
          >
            {displayed.map(course => (
              <motion.div
                key={course.slug}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 hover:bg-white/20 transition-all"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-gray-300">{course.description}</p>
                {course.unlockWithAERA && (
                  <div className="text-xs font-medium text-green-300 border border-green-400 px-2 py-1 w-max rounded-full">
                    Unlocks with {course.unlockWithAERA} AERA
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results Fallback */}
        {displayed.length === 0 && (
          <p className="text-center text-gray-400 pt-10">No matching courses found.</p>
        )}
      </div>
    </main>
  )
}


