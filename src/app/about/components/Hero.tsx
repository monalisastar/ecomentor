


'use client'

// 🧩 Auto-generated static data for CMS
export const staticData = {
  "p_1": "Empowering through data, community, and decentralization."
};

import { motion } from "framer-motion";;

export default function Hero() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-32 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold mb-6"
      >
        About Eco-Mentor
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
      >
        Our platform empowers learners with the knowledge and tools to become carbon-conscious leaders.
        Built for the future of climate education.
      </motion.p>

      <p className="mt-4 text-sm text-green-300">{"{staticData.p_1}"}</p>
    </section>
  )
}

