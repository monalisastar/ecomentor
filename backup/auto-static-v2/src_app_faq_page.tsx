'use client'

import { useState } from "react";;
import { motion, AnimatePresence } from "framer-motion";;
import Link from "next/link";;

const faqs = [
  {
    category: 'General',
    items: [
      {
        question: 'What is Eco-Mentor?',
        answer: 'Eco-Mentor is a futuristic LMS platform focused on climate education, GHG accounting, and carbon market training — powered by trust badges and real-world impact.',
      },
      {
        question: 'Is Eco-Mentor free or paid?',
        answer: 'Some foundational courses are free. Others are premium, with affordable pricing based on course type. We also reward learners with AERA tokens.',
      },
      {
        question: 'Who is Eco-Mentor for?',
        answer: 'Eco-Mentor is for students, professionals, policy makers, and project developers who want practical climate and carbon knowledge.',
      },
    ],
  },
  {
    category: 'Courses & Certification',
    items: [
      {
        question: 'Do I get certificates after completing a course?',
        answer: 'Yes. Every completed course comes with a smart certificate and optional AERA badge if you meet trust criteria.',
      },
      {
        question: 'Can I use these certificates for job applications?',
        answer: 'Absolutely. Each certificate is verifiable and designed to strengthen your sustainability resume.',
      },
      {
        question: 'Do I need prior experience?',
        answer: 'No prior experience is needed. Our courses guide you step-by-step, starting from foundational knowledge.',
      },
    ],
  },
  {
    category: 'Trust & Verification',
    items: [
      {
        question: 'What is the AERA Trust Badge?',
        answer: 'AERA is our Future-Led Reputation system. Learners earn badges based on their verified course completion, participation, and credibility.',
      },
      {
        question: 'How do you prevent fake learners or bots?',
        answer: 'We use AI checks and human moderation for submissions, plus credential verification on select courses.',
      },
      {
        question: 'Is my progress saved?',
        answer: 'Yes. Your dashboard tracks all your course progress, scores, and badge eligibility.',
      },
    ],
  },
  {
    category: 'Tokens & Tech',
    items: [
      {
        question: 'What is the AERA token used for?',
        answer: 'AERA is our platform reward token. You earn it through participation, and it can be used to unlock premium content or verify credentials.',
      },
      {
        question: 'Do I need crypto knowledge?',
        answer: 'No. We simplify everything. You can learn, earn, and explore Web3 features without needing prior blockchain knowledge.',
      },
      {
        question: 'Will I get rewarded for completing modules?',
        answer: 'Yes. Completing select modules or referring new learners can earn you AERA rewards.',
      },
    ],
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const toggle = (question: string) => {
    setOpen(prev => (prev === question ? null : question))
  }

  const filteredFaqs = faqs.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => section.items.length > 0)

  return (
    <main
      className="min-h-screen bg-[url('/images/eco-bg.jpg')] bg-cover bg-center text-white px-6 py-24 md:px-20 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-blue-900/20 to-green-900/10 z-0" />

      <section className="relative z-10 max-w-5xl mx-auto space-y-14">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Browse popular queries or search below to find instant answers.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* FAQ Sections */}
        {filteredFaqs.map((section, index) => (
          <div key={index}>
            <h2 className="text-2xl md:text-3xl font-semibold text-green-400 mb-6 border-b border-green-600 pb-2">
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.items.map(({ question, answer }) => (
                <div key={question} className="border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
                  <button
                    onClick={() => toggle(question)}
                    className="w-full text-left text-lg font-medium text-white flex justify-between items-center"
                  >
                    <span>{question}</span>
                    <span className="text-green-400">{open === question ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {open === question && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-gray-300 mt-2"
                      >
                        <p>{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Support Button */}
        <div className="text-center pt-16">
          <p className="text-gray-300 mb-4">Still need help?</p>
          <Link href="/bot">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition">
              Ask Our AI Assistant
            </button>
          </Link>
        </div>
      </section>

      {/* Floating Help Bot Button */}
      <Link href="/bot">
        <button className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full z-50 shadow-lg">
          🤖 Help
        </button>
      </Link>
    </main>
  )
}

