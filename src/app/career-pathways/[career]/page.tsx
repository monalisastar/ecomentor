// app/career-pathways/[career]/page.tsx

"use client";

import { notFound } from "next/navigation";
import careerPaths from "@/data/careerPaths";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CareerPathPage({ params }: { params: { career: string } }) {
  const career = careerPaths[params.career];

  if (!career) return notFound();

  return (
    <main className="pt-[var(--nav-height)] min-h-screen px-6 md:px-12 py-20 bg-gradient-to-br from-[#061019] via-[#0d1f2b] to-[#061019] text-white relative">

      {/* Background Frost Layer */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">

        {/* Career Title */}
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-green-300">
            {career.title}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            {career.description}
          </p>
        </header>

        {/* Salary + Demand Section */}
        <section className="grid md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
          <div>
            <h3 className="font-semibold text-green-300">Global Avg Salary</h3>
            <p className="text-xl font-bold">{career.salaryGlobal}</p>
          </div>

          <div>
            <h3 className="font-semibold text-blue-300">Africa Avg Salary</h3>
            <p className="text-xl font-bold">{career.salaryAfrica}</p>
          </div>

          <div>
            <h3 className="font-semibold text-purple-300">Industry Demand</h3>
            <p className="text-xl font-bold">{career.demand}</p>
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Required Skills</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            {career.skills.map((s: string) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        {/* Recommended Courses */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recommended Courses</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {career.courses.map((courseSlug: string) => {
              const course = career.courseLookup(courseSlug);
              if (!course) return null;

              return (
                <motion.div
                  key={courseSlug}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    className="block bg-white/10 p-4 rounded-lg border border-white/10 hover:bg-white/20 transition"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <h3 className="font-semibold mt-3">{course.title}</h3>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Back to Courses CTA */}
        <div className="text-center pt-10">
          <Link
            href="/courses"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full text-white font-semibold shadow-lg"
          >
            Browse More Courses
          </Link>
        </div>

      </div>
    </main>
  );
}
