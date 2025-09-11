'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowDownCircle } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full text-white overflow-hidden">
      {/* ✅ Background Image */}
      <Image
        src="/images/hero-background.jpg"
        alt="Eco-Mentor Hero Background"
        fill
        priority
        className="absolute object-cover z-0"
      />

      {/* ✅ Hero Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-snug text-white">
          Empowering Action Through Climate Knowledge
        </h1>
        <p className="mt-4 text-base md:text-xl max-w-xl text-white/90">
          Learn about GHG, carbon markets, tools & certification in a modern, tech-driven platform.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition">
              Start Learning
            </button>
          </Link>
          <Link href="/courses">
            <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition">
              Browse Courses
            </button>
          </Link>
        </div>

        {/* ✅ Scroll Icon */}
        <div className="absolute bottom-6 animate-bounce">
          <ArrowDownCircle size={32} className="text-white/70" />
        </div>
      </div>
    </section>
  )
}

