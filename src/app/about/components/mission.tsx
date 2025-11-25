'use client'

// 🧩 CMS-ready static content
export const staticData = {
  p_1:
    "Eco-Mentor  delivers climate education rooted in scientific integrity, professional standards, and global relevance. Our mission is to equip individuals, communities, and organisations with credible skills that support measurable climate impact and a sustainable future."
};

import { motion } from "framer-motion";
import { FaLeaf, FaUsers, FaBrain, FaRocket } from "react-icons/fa";

export default function MissionValues() {
  const pillars = [
    {
      icon: <FaLeaf size={28} className="text-green-400" />,
      title: "Scientific Integrity",
      description:
        "Every course is built on globally accepted frameworks such as the GHG Protocol, ISO 14064, and IPCC methodologies.",
    },
    {
      icon: <FaBrain size={28} className="text-blue-400" />,
      title: "Knowledge Leadership",
      description:
        "We combine expert instruction, practical tools, and digital innovation to create real-world climate capability.",
    },
    {
      icon: <FaUsers size={28} className="text-purple-400" />,
      title: "Equity & Accessibility",
      description:
        "Our platform is designed to make high-quality climate education available to learners, organisations, and project teams across Africa and beyond.",
    },
    {
      icon: <FaRocket size={28} className="text-yellow-400" />,
      title: "Future-Ready Learning",
      description:
        "Blending climate science with blockchain, AI, and digital verification to prepare learners for emerging sustainability roles.",
    },
  ];

  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20 rounded-xl blur-3xl opacity-40 z-0" />

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-8 relative z-10"
      >
        Our Mission & Core Values
      </motion.h2>

      {/* Intro */}
      <p className="text-center text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed relative z-10">
        {staticData.p_1}
      </p>

      {/* Value Pillars */}
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
              <div className="animate-pulse">{pillar.icon}</div>
              <h3 className="text-xl font-semibold text-green-300">{pillar.title}</h3>
            </div>
            <p className="text-gray-300 text-sm">{pillar.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.2 }}
        className="mt-16 text-center text-green-200 italic text-lg relative z-10"
      >
        “The future belongs to those who prepare to lead it.”
      </motion.div>
    </section>
  );
}
