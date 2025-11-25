'use client'

import { AuroraBackground } from "@/components/ui/aurora";
import { Spotlight } from "@/components/ui/spotlight";

import Hero from "./components/Hero";
import Founder from "./components/Founder";
import MissionValues from "./components/mission";
import Journey from "./components/Timeline";
import WhyTrustUs from "./components/whytrustus";
import Pillars from "./components/Pillars";
import BlockchainCredentials from "./components/BlockchainCredentials";
import CTA from "./components/CTASection";

export default function AboutUsPage() {
  return (
    <main className="pt-[var(--nav-height)] relative min-h-screen overflow-hidden text-white bg-gradient-to-br from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a]">
      <AuroraBackground showRadialGradient animate className="absolute inset-0 -z-10" />
      <Spotlight className="top-10 left-20 h-[30rem] w-[60vw] opacity-40 bg-green-400" />

      {/* --- Corporate About Page Sections --- */}
      <Hero />
      <MissionValues />
      <Pillars />
      <BlockchainCredentials />
      <WhyTrustUs />
      <Founder />
      <Journey />
      <CTA />

      <footer className="relative z-10 text-center py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Eco-Mentor LMS. Built for climate leadership.
      </footer>
    </main>
  );
}
