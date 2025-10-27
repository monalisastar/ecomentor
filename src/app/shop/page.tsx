'use client'

import { useState } from "react";;
import { motion } from "framer-motion";;
import Image from "next/image";;

const products = [
  {
    id: 1,
    name: 'Eco-Mentor Hoodie',
    type: 'Apparel',
    price: 120,
    token: 'AERA',
    image: '/shop/hoodie.jpg',
    status: 'available',
  },
  {
    id: 2,
    name: 'Digital Carbon Certificate',
    type: 'Certificate',
    price: 80,
    token: 'AERA',
    image: '/shop/certificate.jpg',
    status: 'available',
  },
  {
    id: 3,
    name: 'Premium Course Unlock',
    type: 'Token Unlock',
    price: 250,
    token: 'AERA',
    image: '/shop/premium-course.jpg',
    status: 'coming',
  },
  {
    id: 4,
    name: 'Donate AERA to Sponsor a Learner',
    type: 'Donation',
    price: 100,
    token: 'AERA',
    image: '/shop/donation.jpg',
    status: 'available',
  },
  {
    id: 5,
    name: 'Smart Certificate NFT',
    type: 'Digital',
    price: 160,
    token: 'AERA',
    image: '/shop/nft-cert.jpg',
    status: 'coming',
  },
  {
    id: 6,
    name: 'Eco-Mentor Notebook (Print)',
    type: 'Apparel',
    price: 45,
    token: 'AERA',
    image: '/shop/notebook.jpg',
    status: 'available',
  },
  {
    id: 7,
    name: 'Verified Badge T-Shirt',
    type: 'Apparel',
    price: 95,
    token: 'AERA',
    image: '/shop/tshirt.jpg',
    status: 'available',
  },
  {
    id: 8,
    name: 'AI Mentor Assistant Access',
    type: 'Token Unlock',
    price: 300,
    token: 'AERA',
    image: '/shop/ai.jpg',
    status: 'coming',
  },
]

export default function ShopPage() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <main className="relative min-h-screen text-white bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] overflow-hidden px-6 py-20 md:px-16">
      {/* Matching Blue Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <section className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Eco-Mentor Shop</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Explore digital and physical goods that promote climate action — powered by our token, <span className="text-green-400">AERA</span>.
          </p>
          <button
            onClick={() => setShowInfo(true)}
            className="text-sm underline text-green-400 hover:text-green-300"
          >
            What is AERA?
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/10 rounded-xl overflow-hidden shadow-xl border border-white/10 backdrop-blur-md"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-xl"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-gray-300">{product.type}</p>
                <p className="text-green-400 font-semibold">{product.price} {product.token}</p>
                <button
                  disabled={product.status !== 'available'}
                  className={`w-full py-2 mt-2 rounded-md font-medium transition ${
                    product.status === 'available'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {product.status === 'available' ? 'Buy with AERA' : 'Coming Soon'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AERA Modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
            <div className="bg-white/10 backdrop-blur-md p-6 max-w-xl rounded-xl text-white space-y-4 border border-white/20">
              <h2 className="text-2xl font-bold text-green-400">What is AERA?</h2>
              <p>
                <strong>AERA</strong> is the Eco-Mentor shop token inspired by the word “air.”
                It powers eco-conscious purchases within the platform — from apparel to digital unlocks.
              </p>
              <p>
                You can earn AERA by participating in challenges, referring learners, or buying it
                via supported platforms (coming soon).
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700 font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

