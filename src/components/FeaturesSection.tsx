'use client';

import {
  HiOutlineBadgeCheck,
  HiOutlineChartBar,
  HiOutlineDeviceMobile,
  HiOutlineShieldCheck,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { motion } from "framer-motion";

// 🧩 Auto-generated static data for CMS
export const staticData = {
  p_1: "Explore impactful, practical climate training — made for your future.",
  p_2: "Our training is built for global relevance, scientific accuracy, and real career advancement.",
};

// Allow CMS overrides
type FeaturesSectionProps = Partial<typeof staticData>;

const features = [
  {
    title: "Recognized Certificates",
    description: "Earn globally credible sustainability & GHG certificates.",
    icon: HiOutlineBadgeCheck,
  },
  {
    title: "Track Your Progress",
    description: "Visual progress tools help you stay committed and motivated.",
    icon: HiOutlineChartBar,
  },
  {
    title: "Learn Anywhere, Anytime",
    description: "Eco-Mentor works seamlessly across smartphones, tablets, and desktops.",
    icon: HiOutlineDeviceMobile,
  },
  {
    title: "Verified Climate Content",
    description: "Content aligned with UNFCCC, IPCC and internationally accepted standards.",
    icon: HiOutlineShieldCheck,
  },
  {
    title: "Join a Global Network",
    description: "Connect with sustainability learners across 27+ countries.",
    icon: HiOutlineGlobeAlt,
    animateSpin: true,
  },
];

export default function FeaturesSection(props: FeaturesSectionProps = {}) {
  const data = { ...staticData, ...props };

  return (
    <section className="bg-[#f9fbff] dark:bg-gray-900 text-gray-900 dark:text-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why Learn with Eco-Mentor?
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-12">
          {data.p_1}
        </p>

        {/* Features Grid */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                className="flex flex-col items-center text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition min-h-[300px] justify-between"
              >
                {/* ICON */}
                <motion.div
                  whileHover={
                    feature.animateSpin
                      ? { rotate: 360 }
                      : { scale: 1.12 }
                  }
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
                >
                  <Icon size={32} className="text-green-600 dark:text-green-300" />
                </motion.div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold mt-4">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
