'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Founder() {
  return (
    <section className="relative z-10 px-6 md:px-20 py-24 max-w-7xl mx-auto text-white">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center md:items-start"
        >
          <Image
            src="/images/founder.jpg"
            alt="Virginia Njeri - Founder"
            width={160}
            height={160}
            className="rounded-full border-4 border-green-500 shadow-xl mb-4"
          />
          <h2 className="text-2xl font-bold text-green-400 mb-2">Meet the Founder</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Virginia Njeri is the Senior Consultant at Supacare Solutions, a company specializing in sustainable waste
            management, composting, and carbon advisory services. With over 7 years of experience developing carbon
            projects and 7 years as a carbon projects auditor, Virginia offers a wealth of technical expertise and
            practical insights into global carbon markets and climate action.
            <br /><br />
            Her background in Community Development and Business Management uniquely positions her to bridge the gap
            between grassroots impact and strategic climate solutions. At Supacare Solutions, she leads initiatives that
            integrate innovation, sustainability, and local empowerment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="bg-gray-900/60 border border-green-400 rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-green-300">“We don’t just need learners. We need carbon leaders.”</h3>
          <p className="text-sm text-gray-400">— Virginia Njeri</p>

          {/* Future video section */}
          <div className="mt-6">
            <div className="w-full aspect-video bg-black border-2 border-dashed border-green-500 rounded-lg grid place-items-center text-green-400 text-sm">
              🎥 Vision video coming soon...
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

