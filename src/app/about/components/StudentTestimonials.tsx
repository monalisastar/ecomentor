"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function StudentTestimonials() {

  const testimonials = [
    {
      name: "Grace M.",
      role: "GHG Accounting Student",
      image: "/images/graceM.webp", // ✅ correct path
      quote:
        "Eco-Mentor transformed my understanding of climate systems and carbon markets. The lessons were practical, industry-aligned and helped me get my first sustainability internship.",
      stars: 5,
    },
    {
      name: "Daniel K.",
      role: "Carbon Developer Track",
      image: "/images/danielK.webp", // ✅ correct path
      quote:
        "The blockchain-verified certificate gave my CV a real competitive edge. Recruiters immediately took me seriously. I highly recommend Eco-Mentor for anyone entering the climate sector.",
      stars: 5,
    },
    {
      name: "Aisha N.",
      role: "Climate & ESG Diploma",
      image: "/images/AishaM.webp", // ✅ correct path
      quote:
        "I found the platform extremely well structured. The real-world examples, case studies, and tools made learning engaging and relevant to African climate challenges.",
      stars: 5,
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
        What Our Students Say
      </motion.h2>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-10 px-6 md:px-10">

        {testimonials.map((t, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="bg-white/5 border border-white/10 backdrop-blur-lg
                       rounded-2xl p-6 shadow-xl hover:shadow-green-400/20
                       transition-all duration-300 flex flex-col"
          >
            {/* Image */}
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 object-cover rounded-full border border-white/20 mx-auto mb-5"
            />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: t.stars }).map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-sm" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-300 text-sm leading-relaxed text-center mb-4">
              “{t.quote}”
            </p>

            {/* Name */}
            <h3 className="text-green-300 text-lg font-semibold text-center">
              {t.name}
            </h3>

            {/* Role */}
            <p className="text-gray-400 text-xs text-center">{t.role}</p>
          </motion.div>
        ))}

      </div>
    </section>
  );
}
