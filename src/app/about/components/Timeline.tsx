'use client'

// 🧩 CMS-ready static data
export const staticData = {
  p_1:
    "Eco-Mentor LMS was founded with a vision to redefine climate education by combining scientific credibility, technology, and accessible learning pathways.",
  p_2:
    "Launched our first GHG accounting and carbon market programs, deployed the Eco-Mentor LMS platform, and expanded our digital learning ecosystem.",
  p_3:
    "Scaling Eco-Mentor across Africa and globally through standards-aligned learning, blockchain-secured certification, and community impact initiatives."
};

import { motion } from "framer-motion";
import { FaSeedling, FaRocket, FaGlobeAfrica } from "react-icons/fa";

export default function Timeline() {
  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-6xl mx-auto text-white">
      
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-6"
      >
        Our Journey
      </motion.h2>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
      >
        Discover how Eco-Mentor LMS grew from an innovative idea into a trusted platform for 
        credible, practical, and technology-driven climate education.
      </motion.p>

      {/* Video Placeholder */}
      <div className="aspect-video bg-black/40 rounded-xl border border-dashed border-green-500 mb-12 flex items-center justify-center text-green-400 text-sm">
        🎬 Timeline video coming soon...
      </div>

      {/* Milestones */}
      <div className="space-y-10">

        {/* 2023 */}
        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FaSeedling size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2023 — Foundation Stage</h4>
            <p className="text-gray-400 leading-relaxed">{staticData.p_1}</p>
          </div>
        </motion.div>

        {/* 2024 */}
        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FaRocket size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2024 — Launch & Programs</h4>
            <p className="text-gray-400 leading-relaxed">{staticData.p_2}</p>
          </div>
        </motion.div>

        {/* 2025+ */}
        <motion.div
          className="flex items-start gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <FaGlobeAfrica size={32} className="text-green-400" />
          <div>
            <h4 className="text-xl font-semibold text-green-300">2025+ — Growth & Impact</h4>
            <p className="text-gray-400 leading-relaxed">{staticData.p_3}</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
