'use client'

import Image from "next/image";
import { motion } from "framer-motion";

// 🧩 CMS-ready static subtitle
export const staticData = {
  p_1: "— Virginia Njeri"
};

export default function Founder() {
  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">
      <div className="grid md:grid-cols-2 gap-12 items-center">

        {/* Founder Profile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center md:items-start"
        >
          <Image
            src="/images/founder.jpg"
            alt="Virginia Njeri - Founder"
            width={170}
            height={170}
            className="rounded-full border-4 border-green-500 shadow-xl mb-4"
          />

          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Meet the Founder
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed">
            Virginia Njeri is the Founder of Eco-Mentor Ltd and a respected professional in 
            sustainability, climate action, and carbon market development. With over seven years 
            of hands-on experience in carbon project development and auditing, she brings deep 
            technical expertise and a strong commitment to building credible climate capacity across Africa.
            <br /><br />
            Her background in Community Development and Business Management allows her to bridge 
            the gap between high-level climate policy and practical, community-centered solutions. 
            Virginia’s leadership has shaped Eco-Mentor LMS into a platform that blends 
            high-quality climate education, industry-aligned standards, and accessible learning pathways 
            for individuals, organisations, and institutions.
            <br /><br />
            Through her vision, Eco-Mentor  continues to lead in professional climate education, 
            offering trusted learning experiences and blockchain-secured certification for the 
            next generation of sustainability leaders.
          </p>
        </motion.div>

        {/* Founder Quote + Video */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="bg-gray-900/60 border border-green-400 rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-green-300">
            “We don’t just need learners. We need climate leaders.”
          </h3>

          <p className="text-sm text-gray-400">
            {staticData.p_1}
          </p>

          {/* Vision Video Placeholder */}
          <div className="mt-6">
            <div className="w-full aspect-video bg-black border-2 border-dashed border-green-500 rounded-lg grid place-items-center text-green-400 text-sm">
              🎥 Vision video coming soon...
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
