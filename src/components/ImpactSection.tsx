'use client';

import { Globe, Users, Leaf, BadgeCheck } from "lucide-react";
import Image from "next/image";

// 🧩 Static data for CMS integration
export const staticData = {
  p_1: "From individual learners to international organizations, Eco-Mentor is already contributing to the global climate education movement.",
};

// ✅ Allow external CMS overrides
type ImpactSectionProps = Partial<typeof staticData>;

const stats = [
  {
    icon: <Globe size={28} className="text-green-600" />,
    label: "Countries Reached",
    value: "27+",
  },
  {
    icon: <Users size={28} className="text-green-600" />,
    label: "Learners Enrolled",
    value: "3,500+",
  },
  {
    icon: <Leaf size={28} className="text-green-600" />,
    label: "Tons of CO₂ Offset",
    value: "14,200+ tCO₂",
  },
  {
    icon: <BadgeCheck size={28} className="text-green-600" />,
    label: "Certified Instructors",
    value: "30+",
  },
];

export default function ImpactSection(props: ImpactSectionProps = {}) {
  const data = { ...staticData, ...props };

  return (
    <section className="bg-[#f9fbff] text-gray-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Earth Image */}
        <div className="relative w-full h-80 md:h-[500px]">
          <Image
            src="/images/impact-earth.jpg"
            alt="Earth impact visual"
            fill
            className="object-cover rounded-xl shadow-xl"
          />
        </div>

        {/* Right: Text + Stats */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Eco-Mentor in Action
          </h2>

          <p className="text-gray-700 mb-8">{data.p_1}</p>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center md:items-start"
              >
                {stat.icon}
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
