'use client'

import Image from "next/image";;
import Link from "next/link";;

export default function JoinCTA() {
  return (
    <section className="relative h-[80vh] w-full text-white overflow-hidden">
      {/* ✅ Background Image */}
      <Image
        src="/images/join-bg.jpg"
        alt="Join Eco-Mentor"
        fill
        className="absolute z-0 object-cover"
        quality={100}
      />

      {/* ✅ Soft dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* ✅ Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Become a Certified Climate Leader
        </h2>

        <p className="text-lg max-w-xl mb-8 text-white/90">
          Start your journey into climate action, GHG mastery, and global impact. Join thousands already leading the change.
        </p>

        <Link href="/register">
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition">
            Start Learning
          </button>
        </Link>
      </div>
    </section>
  )
}

