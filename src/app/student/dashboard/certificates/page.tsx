'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Share2, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

// --- Certificate Type ---
export interface Certificate {
  id: number
  title: string
  image: string
  category: string
  dateEarned: string
  courseSlug: string
  verified: boolean
}

// --- Mock certificate data ---
const mockCertificates: Certificate[] = [
  { id: 1, title: 'GHG Accounting Pro', image: '/cert-ghg.jpg', category: 'Climate', dateEarned: '2025-08-01', courseSlug: 'ghg-accounting-pro', verified: true },
  { id: 2, title: 'Carbon Management Expert', image: '/cert-carbon.jpg', category: 'Climate', dateEarned: '2025-07-15', courseSlug: 'carbon-management', verified: true },
  { id: 3, title: 'MRV Specialist', image: '/cert-mrv.jpg', category: 'Web3', dateEarned: '2025-06-20', courseSlug: 'mrv-specialist', verified: false },
  { id: 4, title: 'Climate Policy Analyst', image: '/cert-policy.jpg', category: 'Climate', dateEarned: '2025-05-30', courseSlug: 'climate-policy', verified: true },
]

export default function CertificatesDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates)
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()
  const lastCountRef = useRef(certificates.length)

  // --- Live updates simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const newCert: Certificate = {
          id: certificates.length + 1,
          title: `New Course ${certificates.length + 1}`,
          image: '/cert-placeholder.jpg',
          category: 'AI & Data',
          dateEarned: new Date().toISOString(),
          courseSlug: `new-course-${certificates.length + 1}`,
          verified: false,
        }
        setCertificates((prev) => [newCert, ...prev])
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [certificates])

  // --- Filter & Search ---
  const filteredCertificates = certificates.filter((c) => {
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // --- Analytics Data ---
  const categoryData = Object.entries(
    certificates.reduce((acc, cert) => {
      acc[cert.category] = (acc[cert.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const timelineData = certificates
    .slice()
    .sort((a, b) => new Date(a.dateEarned).getTime() - new Date(b.dateEarned).getTime())
    .map((cert) => ({ date: cert.dateEarned.slice(0, 10), count: 1 }))

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b1e2e] via-[#123b52] to-[#0b1e2e] text-white px-6 md:px-16 py-16 space-y-12">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} />}
      <h1 className="text-4xl font-bold text-center mb-6">Your Certificates</h1>

      {/* Filters & Search */}
      <div className="flex flex-wrap justify-between gap-4 mb-8">
        <Input
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select onValueChange={setFilterCategory} defaultValue="All">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Web3">Web3</SelectItem>
            <SelectItem value="AI & Data">AI & Data</SelectItem>
            <SelectItem value="Climate">Climate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCertificates.map((cert) => (
          <motion.div
            key={cert.id}
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 transition"
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedCertificate(cert)}
          >
            <img src={cert.image} alt={cert.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{cert.title}</h3>
              <p className="text-sm text-gray-300">{cert.category}</p>
              <div className="flex items-center gap-2 mt-2">
                {cert.verified && <CheckCircle size={18} className="text-green-400" />}
                <span className="text-xs text-gray-300">{cert.dateEarned.slice(0, 10)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Certificates by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80} fill="#38bdf8">
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={['#38bdf8', '#10b981', '#facc15'][idx % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Certificate Timeline</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <Dialog open={true} onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-xl">
            <DialogHeader>
              <DialogTitle>{selectedCertificate.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex flex-col md:flex-row gap-6">
              <img
                src={selectedCertificate.image}
                alt={selectedCertificate.title}
                className="w-full md:w-1/2 object-cover rounded-lg shadow-lg"
              />
              <div className="flex-1 space-y-4">
                <p><strong>Category:</strong> {selectedCertificate.category}</p>
                <p><strong>Date Earned:</strong> {selectedCertificate.dateEarned.slice(0, 10)}</p>
                <p><strong>Course Slug:</strong> {selectedCertificate.courseSlug}</p>
                <p>
                  <strong>Verification Status:</strong>{' '}
                  {selectedCertificate.verified ? '✅ Verified on Blockchain' : '❌ Pending'}
                </p>

                {!selectedCertificate.verified && (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 mt-2"
                    onClick={() => alert('Trigger blockchain verification')}
                  >
                    Verify on Blockchain
                  </Button>
                )}

                <div className="flex gap-4 mt-4">
                  <Button
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                    onClick={() => alert('Download certificate as PNG/PDF')}
                  >
                    <Download size={16} /> Download
                  </Button>
                  <Button
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                    onClick={() => alert('Share certificate')}
                  >
                    <Share2 size={16} /> Share
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}
