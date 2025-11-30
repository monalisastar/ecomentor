"use client";

import { motion } from "framer-motion";
import { FaLeaf, FaUsers, FaBrain, FaRocket } from "react-icons/fa";

export default function MissionValues() {
  const pillars = [
    {
      icon: <FaLeaf size={24} className="text-green-400" />,
      title: "Scientific Integrity",
      description:
        "Every course follows globally accepted frameworks including the GHG Protocol, ISO 14064, and IPCC methodologies.",
    },
    {
      icon: <FaBrain size={24} className="text-blue-400" />,
      title: "Knowledge Leadership",
      description:
        "We blend expert instruction, practical tools, and digital innovation to build real-world climate capability.",
    },
    {
      icon: <FaUsers size={24} className="text-purple-400" />,
      title: "Equity & Accessibility",
      description:
        "We make quality climate education accessible to learners, organisations, and project teams across Africa and beyond.",
    },
    {
      icon: <FaRocket size={24} className="text-yellow-400" />,
      title: "Future-Ready Learning",
      description:
        "Integrating climate science with blockchain, AI, and verification to prepare learners for emerging sustainability roles.",
    },
  ];

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20 text-white">

      {/* Top Title — LEFT ALIGNED NOW */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-green-400 mb-12 text-left"
      >
        Our Mission & Core Values
      </motion.h2>

      {/* ---- CORPORATE SPLIT LAYOUT with DIVIDERS ---- */}
      <div className="grid md:grid-cols-2 relative mb-16">

        {/* VERTICAL DIVIDER */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20"></div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="pr-0 md:pr-10 pb-12 md:pb-0"
        >
          <div className="border-l-4 border-green-400 pl-5 mb-3">
            <h3 className="text-2xl font-semibold text-green-300">Our Mission</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-[15px]">
            Eco-Mentor delivers climate education rooted in scientific integrity,
            professional standards, and global relevance. We equip individuals,
            communities, and organisations with the skills that support measurable
            climate impact and long-term sustainability.
          </p>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="pl-0 md:pl-10 pt-12 md:pt-0 border-t md:border-t-0 md:border-l border-white/20 md:border-white/0"
        >
          <div className="border-l-4 border-green-400 pl-5 mb-3">
            <h3 className="text-2xl font-semibold text-green-300">Our Vision</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-[15px]">
            To advance global climate capability by empowering the next generation
            of sustainability leaders with trusted, accessible, and tech-enabled
            education that drives meaningful environmental impact.
          </p>
        </motion.div>

      </div>

      {/* ---- VALUE PILLARS ---- */}
      <div className="grid md:grid-cols-2 gap-8">
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.5 }}
            className="bg-gradient-to-br from-white/5 to-white/10 
                       border border-white/10 backdrop-blur-md
                       rounded-xl p-6 shadow-xl hover:shadow-green-500/20
                       transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              {pillar.icon}
              <h4 className="text-lg font-semibold text-green-200">
                {pillar.title}
              </h4>
            </div>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              {pillar.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.9 }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center text-green-200 italic text-lg"
      >
        “The future belongs to those who prepare to lead it.”
      </motion.div>

    </section>
  );
}
