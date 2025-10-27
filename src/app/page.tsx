// app/page.tsx

import HeroSection from "@/components/HeroSection";
import AboutEcoMentor from "@/components/AboutEcoMentor";
import CoursePreview from "@/components/CoursePreview";
import FeaturesSection from "@/components/FeaturesSection";
import ImpactSection from "@/components/ImpactSection";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      <HeroSection />
      <AboutEcoMentor />
      <CoursePreview />
      <FeaturesSection />
      <ImpactSection />
      <JoinCTA />
      <Footer />
    </main>
  );
}
