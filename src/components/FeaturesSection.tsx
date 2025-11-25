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
  p_2: "Eco-Mentor ensures every lesson is verified, engaging, and globally relevant.",
};

// ✅ Allow CMS overrides
type FeaturesSectionProps = Partial<typeof staticData>;

const features = [
  {
    title: "Recognized Certificates",
    description: "Earn credible GHG & climate certificates upon course completion.",
    icon: <HiOutlineBadgeCheck size={32} className="text-green-600" />,
  },
  {
    title: "Track Your Progress",
    description: "Visual progress tracking keeps you motivated throughout.",
    icon: <HiOutlineChartBar size={32} className="text-green-600" />,
  },
  {
    title: "Learn Anywhere, Anytime",
    description: "Responsive LMS works seamlessly across all devices.",
    icon: <HiOutlineDeviceMobile size={32} className="text-green-600" />,
  },
  {
    title: "Verified Climate Content",
    description: "Backed by UN standards and scientifically validated.",
    icon: <HiOutlineShieldCheck size={32} className="text-green-600" />,
  },
  {
    title: "Join the Global Community",
    description: "Connect with 3,000+ learners across 27+ countries.",
    icon: <HiOutlineGlobeAlt size={32} className="text-green-600" />,
    animateSpin: true,
  },
];

export default function FeaturesSection(props: FeaturesSectionProps = {}) {
  // ✅ Merge CMS data with static defaults
  const data = { ...staticData, ...props };

  return (
    <section className="bg-[#f9fbff] dark:bg-gray-900 text-gray-900 dark:text-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why Learn with Eco-Mentor?
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-12">{data.p_1}</p>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition"
              title={feature.description}
            >
              <motion.div
                whileHover={
                  feature.animateSpin ? { rotate: 360 } : { scale: 1.1 }
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 mb-4"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {data.p_2}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
