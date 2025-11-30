'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { courseData } from "@/data/courseData";
import { AnimatePresence, motion } from "framer-motion";

export default function CoursesPage() {
  const router = useRouter();

  // -------- Academic Schools ----------
  const schoolCategories = [
    { key: 'all', label: 'All Courses' },
    { key: 'foundational', label: 'Climate Science & Sustainability Foundations' },
    { key: 'ghg-diplomas', label: 'GHG Accounting & Professional Diplomas' },
    { key: 'carbon-projects', label: 'Carbon Projects & Technology' },
    { key: 'sectoral', label: 'Sectoral Scopes & Industry Applications' },
    { key: 'policy', label: 'Climate Policy, Governance & Finance' },
    { key: 'technology', label: 'Data, Technology & Climate Innovation' },
    { key: 'professional', label: 'Green Jobs, Careers & Leadership' },
  ];

  // ---------- Career Pathways ----------
  const careerPaths = [
    { key: "vvb-auditor", label: "VVB Auditor" },
    { key: "carbon-project-developer", label: "Carbon Project Developer" },
    { key: "ghg-accountant", label: "GHG Accountant" },
    { key: "mrv-specialist", label: "MRV Specialist" },
    { key: "climate-policy-analyst", label: "Climate Policy Analyst" },
    { key: "esg-officer", label: "ESG Officer" },
    { key: "digital-mrv-engineer", label: "Digital MRV Engineer" },
    { key: "climate-data-scientist", label: "Environmental Data Scientist" },
    { key: "netzero-consultant", label: "Net-Zero Consultant" },
    { key: "nbs-specialist", label: "Nature-Based Solutions Specialist" },
  ];

  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  // Filtering logic
  const displayedRaw =
    active === "all"
      ? courseData
      : courseData.filter((c) => c.category === active);

  const displayed = displayedRaw.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sidebar Accordions
  const [openSchools, setOpenSchools] = useState(false);
  const [openCareers, setOpenCareers] = useState(true);

  return (
    <main className="min-h-screen bg-[#06121c] text-white pt-[var(--nav-height)] px-6 md:px-10">

      {/* HERO */}
      <div className="text-center mt-10 space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Eco-Mentor Climate Academy
        </h1>

        {/* LOWERED SEARCH BAR */}
        <div className="flex justify-center mt-16">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-5 py-3 rounded-full w-full max-w-lg text-black bg-white shadow-lg"
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">

        {/* SIDEBAR */}
        <aside className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-6">

          {/* ALL COURSES */}
          <button
            onClick={() => setActive("all")}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition-all
              ${active === "all"
                ? "bg-green-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
              }`}
          >
            All Courses
          </button>

          {/* CAREER PATHWAYS */}
          <div>
            <button
              onClick={() => setOpenCareers(!openCareers)}
              className="w-full flex justify-between items-center font-semibold text-blue-300 pb-2 mt-2"
            >
              <span>Career Pathways</span>
              <span>{openCareers ? "−" : "+"}</span>
            </button>

            {openCareers && (
              <div className="grid grid-cols-1 gap-3 mt-3">
                {careerPaths.map((path) => (
                  <button
                    key={path.key}
                    onClick={() => router.push(`/career-pathways/${path.key}`)}
                    className="w-full px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400/20 text-blue-200 hover:bg-blue-500/30 transition"
                  >
                    {path.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ACADEMIC SCHOOLS */}
          <div>
            <button
              onClick={() => setOpenSchools(!openSchools)}
              className="w-full flex justify-between items-center font-semibold text-green-300 pb-2 mt-4"
            >
              <span>Academic Schools</span>
              <span>{openSchools ? "−" : "+"}</span>
            </button>

            {openSchools && (
              <div className="space-y-3 mt-3">
                {schoolCategories
                  .filter((cat) => cat.key !== "all")
                  .map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActive(cat.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all
                        ${active === cat.key
                          ? "bg-green-500 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </aside>

        {/* COURSE GRID */}
        <section>
          <AnimatePresence mode="wait">
            <motion.div
              key={active + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {displayed.map((course) => (
                <motion.div
                  key={course.slug}
                  whileHover={{ scale: 1.03 }}
                  className="cursor-pointer bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition h-full flex flex-col"
                >
                  {/* IMAGE */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-44 object-cover rounded-t-xl"
                  />

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>

                    <p className="text-sm text-gray-300 mt-2 line-clamp-3 flex-1">
                      {course.description}
                    </p>

                    {/* ENROLL BUTTON */}
                    <Link
                      href={`/courses/${course.slug}/enroll`}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg font-semibold"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {displayed.length === 0 && (
            <p className="text-center text-gray-400 pt-10">
              No matching courses found.
            </p>
          )}
        </section>

      </div>
    </main>
  );
}
