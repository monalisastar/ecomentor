'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Smartphone, CreditCard } from 'lucide-react'
import Image from 'next/image'

export default function PublicCheckout() {
  const { slug } = useParams()
  const router = useRouter()

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Fetch course details
  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true)

        // ✅ FIXED
        const res = await fetch(`/api/public/course/${slug}`)

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Course not found")
        setCourse(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) loadCourse()
  }, [slug])

  async function handleCheckout(method: 'mpesa' | 'card') {
    try {
      setProcessing(true)
      setError('')

      const payload = {
        name,
        email,
        password,
        courseSlug: slug,
        paymentMethod: method
      }

      const response = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      router.push(`/student/courses/${slug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading checkout...
      </div>
    )

  if (error || !course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-600 px-6">
        <h2 className="text-3xl font-semibold mb-2">Error</h2>
        <p className="mb-6">{error}</p>
        <a href="/courses" className="px-6 py-3 bg-green-600 text-white rounded-lg">
          Back to Courses
        </a>
      </div>
    )

  const conversionRate = 150
  const usd = course.priceUSD
  const kes = usd * conversionRate

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-xl overflow-hidden">
        <Image
          src={course.image || '/images/default-course.webp'}
          alt={course.title}
          width={1200}
          height={400}
          unoptimized
          className="w-full h-52 object-cover"
        />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            {course.description}
          </p>

          <div className="bg-gray-100 p-4 rounded-lg mb-8 text-center">
            <span className="text-xl font-semibold text-gray-800">
              Total: <span className="text-green-700">{kes.toLocaleString()} KES</span> ({usd} USD)
            </span>
          </div>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => handleCheckout('mpesa')}
              disabled={processing}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
              {processing ? 'Processing...' : 'Pay with M-Pesa'}
            </button>

            <button
              onClick={() => handleCheckout('card')}
              disabled={processing}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <CreditCard className="w-5 h-5" />
              Pay with Card
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
