"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import careerPaths from "@/data/careerPaths";

export default function CareerPathwaysPage() {
  return (
    <main className="pt-[var(--nav-height)] min-h-screen bg-gradient-to-br from-[#07131d] via-[#0d2333] to-[#07131d] text-white px-6 py-20 md:px-12 relative">

      {/* Background Frost Layer */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide">
            Climate Career Pathways
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Explore real-world climate careers — and unlock the exact courses required
            to become a certified professional across carbon markets, project development,
            GHG accounting, MRV, digital innovation, sectoral specialties, and climate governance.
          </p>
        </div>

        {/* Career Grid */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {Object.keys(careerPaths).map((careerKey) => {
            const career = careerPaths[careerKey];

            return (
              <Link key={careerKey} href={`/career-pathways/${careerKey}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-all space-y-4 h-full flex flex-col"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-green-300">
                      {career.title}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-4">
                      {career.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <p className="text-xs text-gray-400">
                      {career.courses.length} Required Courses
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium text-green-300 border border-green-400 px-3 py-1 rounded-full">
                      View Pathway →
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}
