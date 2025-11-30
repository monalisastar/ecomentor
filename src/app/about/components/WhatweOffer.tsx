"use client";

import { motion } from "framer-motion";
import { FaBookOpen, FaGraduationCap, FaCertificate, FaUsers } from "react-icons/fa";

export default function WhatWeOffer() {

  const items = [
    {
      icon: <FaBookOpen className="text-green-400" size={22} />,
      title: "Professional Climate Courses",
      description:
        "Industry-aligned programs covering GHG accounting, carbon markets, climate science, ESG, and digital MRV.",
    },
    {
      icon: <FaGraduationCap className="text-blue-400" size={22} />,
      title: "Career Learning Tracks",
      description:
        "Structured pathways designed to prepare learners for roles such as Carbon Developer, MRV Analyst, and Sustainability Officer.",
    },
    {
      icon: <FaCertificate className="text-yellow-400" size={22} />,
      title: "Blockchain-Verified Certificates",
      description:
        "Tamper-proof digital credentials that validate skills and provide global proof of expertise.",
    },
    {
      icon: <FaUsers className="text-purple-400" size={22} />,
      title: "Corporate & Institutional Training",
      description:
        "Customized climate capability-building programs for NGOs, universities, governments, and private organisations.",
    },
  ];

  return (
    <section className="relative z-10 w-full py-20 text-white">

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-green-400 mb-12 px-6 md:px-10"
      >
        What We Offer
      </motion.h2>

      {/* FULL-WIDTH GRID (no max width!) */}
      <div className="grid md:grid-cols-2 gap-12 items-center w-full">

        {/* LEFT IMAGE — NOW TOUCHES LEFT EDGE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full"
        >
          <img
            src="/images/A_photograph_captures_four_ethnically_diverse_coll.webp"
            alt="Eco-Mentor Students"
            className="w-full h-[430px] md:h-[520px] lg:h-[560px] 
                     object-cover rounded-none md:rounded-2xl shadow-2xl"
          />
        </motion.div>

        {/* RIGHT CONTENT */}
        <div className="px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex items-start gap-4 p-5 rounded-xl 
                           bg-white/5 border border-white/10
                           backdrop-blur-md hover:shadow-green-500/20
                           transition-all duration-300"
              >
                <div>{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
