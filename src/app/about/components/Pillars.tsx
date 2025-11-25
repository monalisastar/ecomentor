'use client'

import { motion } from "framer-motion";
import { FaCertificate, FaChalkboardTeacher, FaBookReader, FaGlobeAfrica } from "react-icons/fa";

export default function Pillars() {
  const offerings = [
    {
      icon: <FaChalkboardTeacher size={28} className="text-green-400" />,
      title: "Professional Climate Training",
      description:
        "Comprehensive courses aligned with the GHG Protocol, ISO 14064 standards, and IPCC methodologies to equip learners with credible, job-ready climate skills.",
    },
    {
      icon: <FaCertificate size={28} className="text-blue-400" />,
      title: "Blockchain-Verified Certificates",
      description:
        "Every course completion is secured on the blockchain, ensuring tamper-proof, transparent verification for employers, partners, and project auditors.",
    },
    {
      icon: <FaBookReader size={28} className="text-purple-400" />,
      title: "Practical Tools & Case Studies",
      description:
        "Hands-on templates, sector-specific examples, and real climate project insights designed to strengthen applied learning and real-world competence.",
    },
    {
      icon: <FaGlobeAfrica size={28} className="text-yellow-400" />,
      title: "Accessible, Africa-Focused Learning",
      description:
        "Content designed for African practitioners, institutions, and project teams—globally relevant, regionally contextualised, and scalable across communities.",
    },
  ];

  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-12"
      >
        What We Offer
      </motion.h2>

      {/* Offerings Grid */}
      <div className="grid md:grid-cols-2 gap-10 relative z-10">
        {offerings.map((offering, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.2, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl hover:shadow-green-700/30 transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="animate-pulse">{offering.icon}</div>
              <h3 className="text-xl font-semibold text-green-300">{offering.title}</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {offering.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Line Caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 1.2 }}
        className="mt-16 text-center text-green-200 text-lg italic"
      >
        Building credible, future-ready climate professionals.
      </motion.div>
    </section>
  );
}
