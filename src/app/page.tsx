// app/page.tsx

import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import AboutEcoMentor from '../components/AboutEcoMentor'
import CoursePreview from '../components/CoursePreview'
import FeaturesSection from '../components/FeaturesSection'
import ImpactSection from '../components/ImpactSection'
import JoinCTA from '../components/JoinCTA'
import Footer from '../components/Footer'

// Debug: see which imports are undefined
console.log({
  Navbar,
  HeroSection,
  AboutEcoMentor,
  CoursePreview,
  FeaturesSection,
  ImpactSection,
  JoinCTA,
  Footer,
})

export default function Home() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      {Navbar && <Navbar />}
      {HeroSection && <HeroSection />}
      {AboutEcoMentor && <AboutEcoMentor />}
      {CoursePreview && <CoursePreview />}
      {FeaturesSection && <FeaturesSection />}
      {ImpactSection && <ImpactSection />}
      {JoinCTA && <JoinCTA />}
      {Footer && <Footer />}
    </main>
  )
}
