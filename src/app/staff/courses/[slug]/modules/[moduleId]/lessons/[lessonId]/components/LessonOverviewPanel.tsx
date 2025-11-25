'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface LessonOverviewPanelProps {
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
}

export default function LessonOverviewPanel({
  title,
  setTitle,
  description,
  setDescription,
}: LessonOverviewPanelProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm text-gray-200 block mb-2">Lesson Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/10 text-white border-white/30"
          placeholder="Enter lesson title"
        />
      </div>

      <div>
        <label className="text-sm text-gray-200 block mb-2">Lesson Summary</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white/10 text-white border-white/30"
          placeholder="Brief summary of this lesson..."
          rows={4}
        />
      </div>
    </motion.div>
  )
}
