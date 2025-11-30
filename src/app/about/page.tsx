"use client";

import { AuroraBackground } from "@/components/ui/aurora";
import { Spotlight } from "@/components/ui/spotlight";

// Components
import Hero from "./components/Hero";
import Founder from "./components/Founder";
import MissionValues from "./components/mission";

import WhatWeOffer from "./components/WhatweOffer";

import CTA from "./components/CTASection";
import StudentTestimonials from "./components/StudentTestimonials";

export default function AboutUsPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-white
      bg-gradient-to-br from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a]
      pt-[var(--nav-height)]"
    >

      {/* Background Effects */}
      <AuroraBackground
        showRadialGradient
        animate
        className="absolute inset-0 -z-10 opacity-60"
      />

      <Spotlight
        className="top-20 left-20 h-[25rem] w-[50vw] opacity-30 bg-green-400"
      />

      {/* ---- FULL-WIDTH SECTIONS ---- */}
      <section id="hero">
        <Hero />
      </section>

      <section id="mission">
        <MissionValues />
      </section>

      <section id="offer">
        <WhatWeOffer />
      </section>

      <section id="testimonials">
        <StudentTestimonials />
      </section>

   
      <section id="founder">
        <Founder />
      </section>

     

      <section id="cta">
        <CTA />
      </section>

      <footer className="text-center py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Eco-Mentor LMS — Built for Climate Leadership.
      </footer>
    </main>
  );
}
