'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function GlassCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg p-6"
    >
      {children}
    </motion.div>
  )
}
