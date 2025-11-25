'use client'

// 🧩 CMS-ready static text
export const staticData = {
  p_1: "Join thousands of learners, organisations, and climate professionals building credible sustainability skills through Eco-Mentor LMS."
};

import Link from "next/link";
import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";

export default function CTASection() {
  return (
    <section className="relative z-10 py-16 px-4 sm:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto bg-gradient-to-br from-green-900/30 to-green-500/10 p-8 rounded-xl border border-green-700 shadow-lg backdrop-blur-sm"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <FaLeaf className="text-green-400 text-3xl animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-white">
          Ready to Start Your Climate Leadership Journey?
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
          {staticData.p_1}
        </p>

        {/* CTA Button */}
        <Link href="/register">
          <button className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition shadow-md">
            Register Now
          </button>
        </Link>
      </motion.div>
    </section>
  );
}
