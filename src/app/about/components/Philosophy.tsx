



'use client'
// 🧩 Auto-generated static data for CMS
export const staticData = {
  "p_1": "Eco-Mentor is more than a learning platform — it’s a belief system. We design every course, tool,\r\n        and interaction around principles that reflect climate integrity, equity, and a trust-driven future.",
  "p_2": "{pillar.description}"
};

import { motion } from "framer-motion";;
import { FaLeaf, FaUsers, FaBrain, FaRocket } from "react-icons/fa";;

export default function Philosophy() {
  const pillars = [
    {
      icon: <FaLeaf size={28} className="text-green-400" />,
      title: 'Climate First',
      description: 'Every decision supports ecological sustainability and carbon leadership.',
    },
    {
      icon: <FaBrain size={28} className="text-blue-400" />,
      title: 'Decentralized Wisdom',
      description: 'Emphasizes peer learning, local insights, and Web3-powered access.',
    },
    {
      icon: <FaUsers size={28} className="text-purple-400" />,
      title: 'Equity & Access',
      description: 'Built for all — inclusive, open, and globally relevant.',
    },
    {
      icon: <FaRocket size={28} className="text-yellow-400" />,
      title: 'Future-Ready',
      description: 'AI, blockchain, climate — preparing learners for 2030 and beyond.',
    },
  ]

  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20 rounded-xl blur-3xl opacity-40 z-0" />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-8 relative z-10"
      >
        Our Philosophy
      </motion.h2>

      <p className="text-center text-gray-300 max-w-3xl mx-auto mb-14 relative z-10">{"{staticData.p_1}"}</p>

      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.2, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl hover:shadow-green-700/30 transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="animate-pulse">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-semibold text-green-300">{pillar.title}</h3>
            </div>
            <p className="text-gray-300 text-sm">{"{staticData.p_2}"}</p>
          </motion.div>
        ))}
      </div>

      {/* Floating Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.2 }}
        className="mt-16 text-center text-green-200 italic text-lg relative z-10"
      >
        “The future belongs to those who learn to lead it.”
      </motion.div>
    </section>
  )
}

