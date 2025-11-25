'use client'

// 🧩 CMS-ready static text
export const staticData = {
  p_1: "Organisations and learners trust Eco-Mentor for its credible curriculum, standards-aligned training, and transparent blockchain-secured certification."
};

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BsShieldCheck } from "react-icons/bs";

export default function WhyTrustUs() {
  const [trustLevel, setTrustLevel] = useState(0);

  useEffect(() => {
    const target = 94; // Institutional credibility score (symbolic)
    let count = 0;
    const interval = setInterval(() => {
      if (count < target) {
        count++;
        setTrustLevel(count);
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-white text-center">
      
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
        Why Organisations Trust Eco-Mentor
      </h2>

      {/* Corporate description */}
      <p className="text-gray-300 max-w-xl mx-auto mb-6 leading-relaxed">
        {staticData.p_1}
      </p>

      {/* Trust Indicator Bar */}
      <div className="relative max-w-lg mx-auto bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-md">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${trustLevel}%` }}
          transition={{ duration: 2 }}
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-6 rounded-full"
        />
      </div>
      <div className="mt-3 text-sm text-gray-400">{trustLevel}% Credibility Rating</div>

      {/* Highlight Badge */}
      <div className="mt-6 inline-flex items-center gap-3 justify-center bg-green-600/20 text-green-300 py-2 px-4 rounded-full border border-green-500 shadow-sm">
        <BsShieldCheck className="text-green-300" size={18} />
        <span className="text-sm font-medium">Trusted Climate Education Provider</span>
      </div>

      {/* Key institutional trust points */}
      <div className="mt-10 grid md:grid-cols-3 gap-6 text-gray-300 text-sm">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 shadow-sm">
          <h4 className="text-green-300 font-semibold mb-2">Standards-Aligned</h4>
          <p>Training aligned to GHG Protocol, ISO 14064, IPCC methodologies, and global compliance practices.</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 shadow-sm">
          <h4 className="text-green-300 font-semibold mb-2">Blockchain-Verified Certificates</h4>
          <p>All certificates are secured on the blockchain, ensuring tamper-proof verification for employers and auditors.</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 shadow-sm">
          <h4 className="text-green-300 font-semibold mb-2">Practical & Industry-Relevant</h4>
          <p>Curriculum developed by climate experts with real-world case studies and sector-specific insights.</p>
        </div>
      </div>

    </section>
  );
}
