// app/page.tsx
import { getMergedContent } from "@/lib/cms";
import HeroSection from "@/components/HeroSection";
import AboutEcoMentor from "@/components/AboutEcoMentor";
import CoursePreview from "@/components/CoursePreview";
import FeaturesSection from "@/components/FeaturesSection";
import ImpactSection from "@/components/ImpactSection";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

/**
 * 🏠 Home Page (CMS-Aware)
 * --------------------------------------------------
 * Dynamically merges static content + database edits
 * via getMergedContent('home').
 * --------------------------------------------------
 */
export default async function Home() {
  // ✅ Fetch merged data (DB overrides + static defaults)
  const content = await getMergedContent("home");

  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      {/* Each section gets its merged data props */}
      <HeroSection {...content.HeroSection} />
      <AboutEcoMentor {...content.AboutEcoMentor} />
      <CoursePreview />
      <FeaturesSection {...content.FeaturesSection} />
      <ImpactSection {...content.ImpactSection} />
      <JoinCTA {...content.JoinCTA} />
      <Footer />
    </main>
  );
}
