'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Megaphone, Trash2, PlusCircle } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  date: string
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'New Course Launched 🎉',
    message: 'Climate Finance 101 is now available for enrollment.',
    date: '2025-09-01',
  },
  {
    id: 'ann-002',
    title: 'System Maintenance',
    message: 'The platform will undergo scheduled maintenance on Sept 10.',
    date: '2025-09-03',
  },
]

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const handleAdd = () => {
    if (!newTitle || !newMessage) return
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      message: newMessage,
      date: new Date().toISOString().split('T')[0],
    }
    setAnnouncements(prev => [newAnnouncement, ...prev])
    setNewTitle('')
    setNewMessage('')
  }

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <motion.div
      className="p-6 rounded-2xl glass-card shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-yellow-300" />
            Announcements Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* New Announcement Form */}
          <div className="mb-6 space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Announcement Title"
              className="w-full p-2 rounded-md bg-white/20 text-white placeholder-white/60 focus:outline-none"
            />
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Write your announcement..."
              rows={3}
              className="w-full p-2 rounded-md bg-white/20 text-white placeholder-white/60 focus:outline-none"
            />
            <Button
              onClick={handleAdd}
              className="bg-green-500/80 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Announcement
            </Button>
          </div>

          {/* Announcements List */}
          <ul className="space-y-4">
            {announcements.map(a => (
              <li
                key={a.id}
                className="p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{a.title}</h3>
                    <p className="text-sm text-gray-200">{a.message}</p>
                    <span className="text-xs text-gray-400">Posted: {a.date}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-500/80 hover:bg-red-600 text-white"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}
