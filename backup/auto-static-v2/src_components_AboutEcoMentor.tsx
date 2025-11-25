'use client'

import Image from "next/image";;
import { Globe } from "lucide-react";;

export default function AboutEcoMentor() {
  return (
    <section className="bg-white text-gray-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side: Textual Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Why Eco-Mentor Exists
          </h2>

          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            Eco-Mentor is more than a learning platform — it’s a global initiative to educate and equip the next generation of carbon leaders. 
            With expert-driven content, tools for real-world GHG tracking, and immersive coursework, we empower individuals and organizations 
            to take meaningful action against climate change.
          </p>

          <p className="text-lg leading-relaxed mb-6 text-gray-700">
            From climate basics to advanced carbon accounting, our programs are designed to meet you where you are — and take you where 
            the planet needs you to be.
          </p>

          <div className="flex items-center gap-4 bg-green-100 text-green-900 px-4 py-3 rounded-lg shadow-sm w-fit">
            <Globe size={24} />
            <span className="text-sm font-medium">
              Trusted by learners in 27+ countries — and growing.
            </span>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="relative w-full h-80 md:h-[500px]">
          <Image
            src="/images/impact-earth.jpg"
            alt="Global climate education visual"
            fill
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}

