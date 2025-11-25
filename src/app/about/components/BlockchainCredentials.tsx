'use client'

import { motion } from "framer-motion";
import { FaLock, FaQrcode, FaCheckCircle } from "react-icons/fa";

export default function BlockchainCredentials() {
  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-green-400 mb-10"
      >
        Blockchain-Verified Certificates
      </motion.h2>

      {/* Intro paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed"
      >
        Eco-Mentor LMS issues tamper-proof, blockchain-secured Certificates of Completion for 
        all training programs. Each credential is permanently recorded on-chain, ensuring 
        transparency, trust, and verifiable authenticity for learners, organisations, 
        project developers, auditors, and employers.
      </motion.p>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl hover:shadow-green-700/20 transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaLock size={28} className="text-green-400" />
            <h3 className="text-xl font-semibold text-green-300">Tamper-Proof Records</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Certificates are stored on a secure blockchain ledger, preventing manipulation, 
            duplication, and credential fraud.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl hover:shadow-green-700/20 transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaQrcode size={28} className="text-blue-400" />
            <h3 className="text-xl font-semibold text-green-300">Instant Verification</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Each certificate includes a unique blockchain ID and QR code that organisations 
            can verify instantly — no middleman needed.
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl hover:shadow-green-700/20 transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaCheckCircle size={28} className="text-yellow-400" />
            <h3 className="text-xl font-semibold text-green-300">Global Credibility</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Eco-Mentor’s blockchain credentials enhance professional reputation and ensure 
            trustworthiness for climate-related roles and sustainability reporting.
          </p>
        </motion.div>

      </div>

      {/* Bottom CTA-style tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 1.2 }}
        className="mt-16 text-center text-green-200 text-lg italic"
      >
        Empowering learners with secure, verifiable, future-ready climate credentials.
      </motion.div>
    </section>
  );
}
