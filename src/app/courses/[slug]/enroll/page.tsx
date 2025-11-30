'use client';

import { useParams, useRouter } from "next/navigation";
import { courseData } from "@/data/courseData";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EnrollPage() {
  const router = useRouter();
  const { slug } = useParams();

  // Find the course by slug
  const course = courseData.find((c) => c.slug === slug);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Course not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#06121c] text-white pt-[var(--nav-height)] px-6 md:px-10 pb-20">
      
      {/* HEADER IMAGE */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg"
      >
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* TITLE + TAGLINE */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-10 space-y-3"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-white">
          {course.title}
        </h1>

        <p className="text-gray-300 max-w-3xl text-lg md:text-xl">
          Begin your professional journey in sustainability, climate action, and green careers.
        </p>
      </motion.div>

      {/* GRID LAYOUT */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

        {/* LEFT SECTION */}
        <div className="space-y-10">

          {/* ABOUT THE COURSE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-white/5 p-7 rounded-xl border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold text-white mb-4">About This Course</h2>
            <p className="text-gray-300 leading-relaxed">{course.description}</p>
          </motion.div>

          {/* WHAT YOU WILL LEARN */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="bg-white/5 p-7 rounded-xl border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold text-white mb-4">What You Will Learn</h2>

            <ul className="text-gray-300 space-y-3 list-disc pl-5">
              {(course.learn || [
                "Core concepts in climate science",
                "Understanding greenhouse gas emissions",
                "Tools and frameworks for sustainability",
                "Real-world climate career applications",
              ]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* RIGHT SIDEBAR (Price + CTA) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-white/5 p-7 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm h-max"
        >
          <h3 className="text-2xl font-bold text-white mb-2">Enroll Today</h3>

          <p className="text-gray-300 mb-6">
            Secure your spot and begin your certification journey.
          </p>

          {/* PRICE */}
          <div className="bg-green-600/20 border border-green-600/40 p-4 rounded-lg mb-6">
            <p className="text-lg text-green-300 font-semibold">
              Price: {course.price ? `KES ${course.price.toLocaleString()}` : "KES 3,500"}
            </p>
          </div>

          {/* CTA BUTTON */}
          <button
            onClick={() => router.push(`/checkout/${slug}`)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg text-lg transition"
          >
            Proceed to Checkout
          </button>

          {/* Back to Courses */}
          <Link 
            href="/courses" 
            className="block text-center mt-4 text-gray-300 hover:text-white transition"
          >
            ← Back to Courses
          </Link>
        </motion.div>

      </div>

    </main>
  );
}
