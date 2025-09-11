'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { courseData } from '@/data/courseData'


export default function AeraWalletPage() {
  const balance = 430;
  const usdEquivalent = (balance * 0.1).toFixed(2);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("0x1234...ABCD"); // Placeholder
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mockTransactions = [
    { date: '2025-05-22', action: 'Referral Bonus', amount: '+80 AERA' },
    { date: '2025-05-21', action: 'Token Airdrop', amount: '+20 AERA' },
    { date: '2025-05-20', action: 'Earned from Course Completion', amount: '+20 AERA' },
    { date: '2025-05-19', action: 'Referral Bonus', amount: '+50 AERA' },
    { date: '2025-05-18', action: 'Earned from Course Completion', amount: '+80 AERA' },
  ];

  const mockNFTs = [
    {
      id: 1,
      name: 'Tree Planting Certificate',
      image: '/images/nft-tree.png',
      badge: 'Verified by Eco-Mentor',
    },
    {
      id: 2,
      name: 'Clean Cooking Proof',
      image: '/images/nft-cookstove.png',
      badge: 'Gold Project Award',
    },
    {
      id: 3,
      name: 'Waste Management Token',
      image: '/images/nft-waste.png',
      badge: 'Impact Verified',
    },
  ];

  const unlockable = courseData.filter(c => c.unlockWithAERA && c.unlockWithAERA <= balance);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] text-white px-6 py-20 md:px-16">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0" />

      <section className="relative z-10 max-w-6xl mx-auto space-y-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">AERA Wallet</h1>
          {/* ConnectButton removed */}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
          <div>
            <p className="text-sm text-gray-300">Wallet (simulated):</p>
            <p className="font-mono text-white text-sm flex items-center gap-2">
              0x1234...ABCD
              <button onClick={handleCopy}>
                📋
              </button>
              {copied && <span className="text-green-400 ml-2 text-xs">Copied!</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Estimated Value:</p>
            <p className="text-green-400 text-lg font-semibold">${usdEquivalent} USD</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-lg text-green-400 font-semibold">
            Your Current Balance: {balance} AERA
          </p>
          <p className="text-gray-300">
            Earn AERA by completing courses, inviting learners, and unlocking achievements.
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <ul className="divide-y divide-white/10">
            {mockTransactions.map((tx, index) => (
              <li key={index} className="py-2 flex justify-between text-sm md:text-base">
                <span className="text-gray-200">{tx.date}</span>
                <span className="text-white">{tx.action}</span>
                <span className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Courses You Can Unlock</h2>
          {unlockable.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {unlockable.map(course => (
                <motion.div
                  key={course.slug}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md space-y-3"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-300">{course.description}</p>
                  <div className="text-xs font-medium text-green-300 border border-green-400 px-2 py-1 w-max rounded-full">
                    Unlock with {course.unlockWithAERA} AERA
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 mt-2 rounded-md">
                    Unlock Now
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No unlockable courses at the moment. Earn more AERA!</p>
          )}
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Stake AERA (Coming Soon)</h2>
          <p className="text-sm text-gray-300 mb-4">
            Support verified climate projects and earn bonus rewards by staking AERA tokens.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              placeholder="Enter amount to stake"
              disabled
              className="w-full sm:w-1/2 p-2 rounded bg-white/10 border border-white/20 text-gray-400 placeholder-gray-500"
            />
            <button
              disabled
              className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Stake
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Climate Proof NFTs</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {mockNFTs.map(nft => (
              <div
                key={nft.id}
                className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 space-y-2"
              >
                <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover rounded" />
                <h3 className="text-lg font-semibold">{nft.name}</h3>
                <p className="text-sm text-green-400">{nft.badge}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-10 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Coming Soon:</p>
          <p className="text-green-300 font-semibold">
            Stake AERA, Mint Proof NFTs, and Redeem Climate Rewards.
          </p>
        </div>
      </section>
    </main>
  );
}

