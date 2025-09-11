'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BsShieldCheck } from 'react-icons/bs'

export default function TrustMeter() {
  const [trustLevel, setTrustLevel] = useState(0)

  useEffect(() => {
    const target = 78 // Simulated trust score
    let count = 0
    const interval = setInterval(() => {
      if (count < target) {
        count++
        setTrustLevel(count)
      } else {
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-white text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">Your AERA Trust Score</h2>
      <p className="text-gray-300 max-w-xl mx-auto mb-6">
        This represents your learning credibility across Eco-Mentor. Complete courses, contribute knowledge,
        and verify certificates to earn more AERA and level up your trust badge.
      </p>

      <div className="relative max-w-lg mx-auto bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-md">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${trustLevel}%` }}
          transition={{ duration: 2 }}
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-6 rounded-full"
        />
      </div>
      <div className="mt-3 text-sm text-gray-400">{trustLevel}% Credibility</div>

      <div className="mt-6 inline-flex items-center gap-3 justify-center bg-green-600/20 text-green-300 py-2 px-4 rounded-full border border-green-500 shadow-sm">
        <BsShieldCheck className="text-green-300" size={18} />
        <span className="text-sm font-medium">AERA Trust Badge (Level 3)</span>
      </div>
    </section>
  )
}

