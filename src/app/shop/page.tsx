'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// 🧩 Static data for CMS (auto-editable later)
export const staticData = {
  "h1_1": "Eco-Mentor Shop",
  "p_1": "Explore digital and physical goods that promote climate action — powered by our token, AERA.",
  "button_1": "What is AERA?",
  "p_2": "Category",
  "p_3": "Price",
  "button_4": "Buy Now",
  "p_5": "AERA is the Eco-Mentor token inspired by the word 'air'. It powers eco-conscious purchases within the platform — from apparel to digital unlocks."
};

const products = [
  {
    id: 1,
    name: 'Eco-Mentor Hoodie',
    type: 'Apparel',
    price: 120,
    token: 'AERA',
    image: '/shop/hoodie.webp',
    status: 'available',
  },
  {
    id: 2,
    name: 'Digital Carbon Certificate',
    type: 'Certificate',
    price: 80,
    token: 'AERA',
    image: '/shop/certificate.webp',
    status: 'available',
  },
  {
    id: 3,
    name: 'Premium Course Unlock',
    type: 'Token Unlock',
    price: 250,
    token: 'AERA',
    image: '/shop/premium-course.webp',
    status: 'coming',
  },
  {
    id: 4,
    name: 'Donate AERA to Sponsor a Learner',
    type: 'Donation',
    price: 100,
    token: 'AERA',
    image: '/shop/donation.webp',
    status: 'available',
  },
  {
    id: 5,
    name: 'Smart Certificate NFT',
    type: 'Digital',
    price: 160,
    token: 'AERA',
    image: '/shop/nft-cert.webp',
    status: 'coming',
  },
  {
    id: 6,
    name: 'Eco-Mentor Notebook (Print)',
    type: 'Apparel',
    price: 45,
    token: 'AERA',
    image: '/shop/notebook.webp',
    status: 'available',
  },
  {
    id: 7,
    name: 'Verified Badge T-Shirt',
    type: 'Apparel',
    price: 95,
    token: 'AERA',
    image: '/shop/tshirt.webp',
    status: 'available',
  },
  {
    id: 8,
    name: 'AI Mentor Assistant Access',
    type: 'Token Unlock',
    price: 300,
    token: 'AERA',
    image: '/shop/ai.webp',
    status: 'coming',
  },
];

export default function ShopPage() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main className="relative min-h-screen text-white bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] overflow-hidden px-6 py-20 md:px-16">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <section className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{staticData.h1_1}</h1>
          <p className="text-gray-300 max-w-xl mx-auto">{staticData.p_1}</p>
          <button
            onClick={() => setShowInfo(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-medium text-white transition"
          >
            {staticData.button_1}
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
                <p className="text-sm text-gray-300">{`${staticData.p_2}: ${product.type}`}</p>
                <p className="text-green-400 font-semibold">
                  {`${staticData.p_3}: ${product.price} ${product.token}`}
                </p>
                <button
                  disabled={product.status !== "available"}
                  className={`w-full py-2 mt-2 rounded-md font-medium transition ${
                    product.status === "available"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-white/10 text-white/50 cursor-not-allowed"
                  }`}
                >
                  {staticData.button_4}
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
              <p>{staticData.p_5}</p>
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
  );
}
