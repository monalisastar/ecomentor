'use client'

import { motion } from 'framer-motion'
import { FaSeedling, FaRocket, FaGlobeAfrica } from 'react-icons/fa'

export default function Timeline() {
  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-6xl mx-auto text-white">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-6"
      >
        Our Journey
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center text-gray-300 max-w-3xl mx-auto mb-10"
      >
        Explore how Eco-Mentor evolved from a simple idea into a movement for climate education and carbon innovation.
      </motion.p>

      {/* Video Placeholder */}
      <div className="aspect-video bg-black/40 rounded-xl border border-dashed border-green-500 mb-12 flex items-center justify-center text-green-400 text-sm">
        🎬 Video timeline coming soon...
      </div>

      {/* Milestone Timeline */}
      <div className="space-y-10">
        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FaSeedling size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2023 — Seed Stage</h4>
            <p className="text-gray-400">
              Eco-Mentor was founded with a bold vision to revolutionize sustainability education through tech.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FaRocket size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2024 — Launch & Courses</h4>
            <p className="text-gray-400">
              Launched first carbon market and GHG accounting courses. Built core LMS & dashboard features.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <FaGlobeAfrica size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2025+ — Expansion & Impact</h4>
            <p className="text-gray-400">
              Global rollout of Eco-Mentor for African and worldwide learners. Launch of AERA token and rewards.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

