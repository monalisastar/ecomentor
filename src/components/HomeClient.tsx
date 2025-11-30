"use client";

import HeroSection from "@/components/HeroSection";
import AboutEcoMentor from "@/components/AboutEcoMentor";
import CoursePreview from "@/components/CoursePreview";
import FeaturesSection from "@/components/FeaturesSection";
import ImpactSection from "@/components/ImpactSection";
import ConsultancyPipeline from "@/components/ConsultancyPipeline";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

export default function HomeClient({ content }) {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden pt-[var(--nav-height)]">
      <HeroSection {...content.HeroSection} />
      <AboutEcoMentor {...content.AboutEcoMentor} />
      <CoursePreview />
      <FeaturesSection {...content.FeaturesSection} />
      <ImpactSection {...content.ImpactSection} />
      <ConsultancyPipeline />
      <JoinCTA {...content.JoinCTA} />
      <Footer />
    </main>
  );
}
