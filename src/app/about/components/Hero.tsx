'use client'

import { motion } from "framer-motion";

// 🧩 Static CMS-ready data (optional)
export const staticData = {
  p_1: "Advancing climate education through credible standards, technology, and transparent certification."
};

export default function Hero() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-32 text-center">
      
      {/* Corporate Header */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold mb-6 text-white"
      >
        About Eco-Mentor
      </motion.h1>

      {/* Corporate Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
      >
        Eco-Mentor  is a professional climate education platform dedicated to building the World next 
        generation of sustainability and carbon market experts. We deliver industry-aligned training, 
        practical tools, and blockchain-verified certificates to support individuals, organisations, 
        and institutions in the transition to a low-carbon economy.
      </motion.p>

      {/* Corporate Mini Tagline */}
      <p className="mt-5 text-sm text-green-300 tracking-wide">
        {staticData.p_1}
      </p>
    </section>
  );
}
