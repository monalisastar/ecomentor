'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Announcement = {
  id: number
  title: string
  content: string
  audience: 'All' | 'Students' | 'Lecturers' | 'Staff'
  date: string
}

const mockAnnouncements: Announcement[] = [
  { id: 1, title: 'Welcome Back!', content: 'Platform updates and guidelines for new semester.', audience: 'All', date: '2025-09-05' },
  { id: 2, title: 'Exam Schedule', content: 'Students please check the updated exam timetable.', audience: 'Students', date: '2025-09-04' },
  { id: 3, title: 'Staff Meeting', content: 'Monthly staff meeting scheduled for Friday.', audience: 'Staff', date: '2025-09-03' },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [creating, setCreating] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>({
    id: Date.now(),
    title: '',
    content: '',
    audience: 'All',
    date: new Date().toISOString().slice(0, 10),
  })

  const filteredAnnouncements = announcements.filter(
    a => a.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditSave = (updated: Announcement) => {
    setAnnouncements(prev =>
      prev.map(a => (a.id === updated.id ? updated : a))
    )
    setEditing(null)
  }

  const handleCreateSave = () => {
    setAnnouncements(prev => [...prev, { ...newAnnouncement, id: Date.now() }])
    setNewAnnouncement({
      id: Date.now(),
      title: '',
      content: '',
      audience: 'All',
      date: new Date().toISOString().slice(0, 10),
    })
    setCreating(false)
  }

  const handleDelete = (id: number) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📢 Manage Announcements</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          ➕ New Announcement
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search announcements..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white mb-6"
      />

      {/* Announcements Table */}
      <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <table className="w-full text-left text-white">
          <thead className="border-b border-white/20">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Audience</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.map(a => (
              <tr key={a.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.title}</td>
                <td className="p-2">{a.audience}</td>
                <td className="p-2">{a.date}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => setEditing(a)}
                    className="px-2 py-1 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-2 py-1 bg-red-600 rounded-lg text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">✏️ Edit Announcement</h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleEditSave(editing)
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                <textarea
                  value={editing.content}
                  onChange={e => setEditing({ ...editing, content: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white h-28"
                />
                <select
                  value={editing.audience}
                  onChange={e => setEditing({ ...editing, audience: e.target.value as Announcement['audience'] })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Lecturers">Lecturers</option>
                  <option value="Staff">Staff</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">➕ New Announcement</h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleCreateSave()
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Title"
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                />
                <textarea
                  placeholder="Content"
                  value={newAnnouncement.content}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white h-28"
                />
                <select
                  value={newAnnouncement.audience}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value as Announcement['audience'] })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Lecturers">Lecturers</option>
                  <option value="Staff">Staff</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    Post
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
