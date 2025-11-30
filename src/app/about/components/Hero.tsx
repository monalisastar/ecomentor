"use client";

import { motion } from "framer-motion";

export const staticData = {
  p_1: "Advancing climate education through credible standards, technology, and transparent certification."
};

export default function Hero() {
  return (
    <section className="relative z-10 w-full bg-transparent">
      
      {/* FULL WIDTH CONTAINER */}
      <div className="w-full px-6 md:px-10 py-10">

        {/* FIXED HEIGHT GRID */}
        <div className="grid md:grid-cols-2 gap-10 items-center min-h-[420px] w-full">

          {/* LEFT — TEXT */}
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight"
            >
              About Eco-Mentor
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-gray-300 leading-relaxed mb-4"
            >
              Eco-Mentor is a professional climate education platform dedicated to 
              developing the next generation of sustainability and carbon market 
              experts. We deliver industry-aligned training, practical tools, 
              and blockchain-verified certificates to support individuals, 
              organisations, and institutions in the transition to a low-carbon economy.
            </motion.p>

            <p className="text-sm text-green-300 tracking-wide">
              {staticData.p_1}
            </p>
          </div>

          {/* RIGHT — HUGE IMAGE */}
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="/images/about.hero.webp"
              alt="Eco-Mentor"
              className="w-full h-[420px] md:h-[460px] lg:h-[500px] xl:h-[520px] object-cover rounded-2xl shadow-xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
