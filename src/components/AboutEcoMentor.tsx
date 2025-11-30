'use client';

import Image from "next/image";
import { Globe } from "lucide-react";

// 🧩 Static data for CMS integration
export const staticData = {
  h2_1: "Why Eco-Mentor Exists",
  p_1:
    "Eco-Mentor is more than a learning platform — it is a global climate education initiative built to develop the next generation of carbon and sustainability leaders. Through expert-led content, real-world GHG tools, and technology-enhanced learning experiences, we equip individuals and organizations with the knowledge required to drive meaningful climate action.",
  p_2:
    "Our programs span foundational climate literacy to advanced carbon accounting and MRV systems, ensuring every learner discovers a clear pathway into the climate economy. Whether you are starting your sustainability journey or strengthening professional expertise, Eco-Mentor is designed to meet your goals — and prepare you for where the world is heading.",
  span_1: "Trusted by learners in 27+ countries — and growing.",
};

type AboutEcoMentorProps = Partial<typeof staticData>;

export default function AboutEcoMentor(props: AboutEcoMentorProps = {}) {
  // ✅ Merge DB/CMS props with static defaults
  const data = { ...staticData, ...props };

  return (
    <section className="bg-white text-gray-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side: Textual Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {data.h2_1}
          </h2>

          <p className="text-lg leading-relaxed mb-4 text-gray-700 text-justify">
            {data.p_1}
          </p>

          <p className="text-lg leading-relaxed mb-6 text-gray-700 text-justify">
            {data.p_2}
          </p>

          <div className="flex items-center gap-4 bg-green-100 text-green-900 px-4 py-3 rounded-lg shadow-sm w-fit">
            <Globe size={24} />
            <span className="text-sm font-medium">
              {data.span_1}
            </span>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="relative w-full h-80 md:h-[500px]">
          <Image
            src="/images/impact-earth.webp"
            alt="Global climate education visual"
            fill
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
