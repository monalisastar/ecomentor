"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ConsultancyPipeline() {
  return (
    <section className="relative py-24 px-6 lg:px-20 overflow-hidden bg-gradient-to-b from-[#0b0f19] via-[#0a1a1f] to-[#071013]">
      
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-20 left-0 w-[40rem] h-[40rem] rounded-full bg-emerald-500 blur-[180px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] rounded-full bg-blue-500 blur-[180px] opacity-20"></div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center text-3xl md:text-4xl font-bold text-white mb-6"
        >
          Training → Certification → Real-World Impact
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center text-gray-300 max-w-3xl mx-auto mb-14"
        >
          Eco-Mentor equips you with industry-ready climate and sustainability skills.  
          Through our implementation partner, <span className="text-emerald-400">Supacare Solutions</span>,
          certified learners can access consultancy opportunities — while organizations can request  
          professional sustainability and carbon project services.
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl
                       border border-white/10 shadow-xl hover:shadow-2xl
                       hover:scale-[1.02] transition-all duration-300
                       hover:bg-white/15"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Apply as a Sustainability Consultant
            </h3>
            <p className="text-gray-300 mb-6">
              Join Supacare’s consultant pool for MRV, carbon project development, 
              baseline surveys, ESG reporting, and field sustainability work.
            </p>

            <Link
              href="https://www.supacaresolutions.com/careers"
              target="_blank"
              className="inline-flex items-center justify-center
                         px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 
                         transition text-white font-medium shadow-lg shadow-emerald-500/30"
            >
              Apply as a Consultant
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl
                       border border-white/10 shadow-xl hover:shadow-2xl
                       hover:scale-[1.02] transition-all duration-300
                       hover:bg-white/15"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Corporate Consultancy for Organizations
            </h3>
            <p className="text-gray-300 mb-6">
              Companies, institutions, and NGOs can request full-service consultancy  
              powered by Supacare Solutions — including audits, ESG, carbon projects,  
              waste management, and sustainability strategy.
            </p>

            <Link
              href="https://www.supacaresolutions.com/services/environmental-consultancy"
              target="_blank"
              className="inline-flex items-center justify-center
                         px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600
                         transition text-white font-medium shadow-lg shadow-blue-500/30"
            >
              Request Consultancy
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
