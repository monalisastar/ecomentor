'use client'

import { motion } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'

interface LessonContentPanelProps {
  content: string
  setContent: (value: string) => void
}

export default function LessonContentPanel({
  content,
  setContent,
}: LessonContentPanelProps) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold mb-3 text-green-300">
        Lesson Content
      </h3>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="bg-white/10 text-white border-white/30 min-h-[300px]"
        placeholder="Write or paste your lesson content here..."
      />
    </motion.div>
  )
}
