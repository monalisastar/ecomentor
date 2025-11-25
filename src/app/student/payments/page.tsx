'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import Image from 'next/image'
import { Loader2, CheckCircle, CreditCard, Smartphone } from 'lucide-react'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const courseSlug = searchParams.get('course')
  const amountParam = Number(searchParams.get('amount')) || 0

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // 🧠 Fetch course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        const res = await fetch(`/api/courses/${courseSlug}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load course')
        setCourse(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (courseSlug) fetchCourse()
  }, [courseSlug])

  // 💳 Simulate payment + enrollment
  async function handlePayment(method: 'mpesa' | 'card') {
    try {
      setProcessing(true)
      setError('')

      // 💰 Simulate payment delay
      await new Promise((r) => setTimeout(r, 1500))

      // ✅ Enroll after payment
      const res = await apiRequest('enrollments', 'POST', {
        courseId: course.id,
        paymentMethod: method,
        paymentStatus: 'PAID',
        amountPaid: course.priceUSD || amountParam,
      })

      if (res.error) throw new Error(res.error)

      setSuccess(true)
      setTimeout(() => {
        router.push(`/student/courses/${courseSlug}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading payment details...
      </div>
    )

  if (error || !course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <h2 className="text-3xl font-semibold mb-2">Payment Error</h2>
        <p className="mb-6">{error || 'Unable to load payment page.'}</p>
        <a
          href="/student/courses"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Courses
        </a>
      </div>
    )

  if (success)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-semibold text-green-700 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">Redirecting you to your course...</p>
      </div>
    )

  // 💰 Currency Conversion (USD → KES)
  const conversionRate = 150 // Example: 1 USD = 150 KES
  const usdAmount = course.priceUSD || amountParam
  const kesAmount = usdAmount * conversionRate

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-xl overflow-hidden">
        {/* 🖼️ Banner */}
        <Image
          src={course.image || '/images/default-course.jpg'}
          alt={course.title}
          width={1200}
          height={500}
          unoptimized
          className="w-full h-56 object-cover"
        />

        <div className="p-8 text-center">
          {/* 🧭 Course Info */}
          <h1 className="text-3xl font-semibold mb-3 text-gray-900">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {course.description || 'Course description coming soon.'}
          </p>

          {/* 💰 Amount Display */}
          <div className="bg-gray-100 p-5 rounded-lg mb-8">
            <p className="text-xl font-semibold text-gray-800">
              Total Amount:{' '}
              <span className="text-green-700">
                KES {kesAmount.toLocaleString()} ({usdAmount} USD)
              </span>
            </p>
          </div>

          {/* 💳 Payment Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => handlePayment('mpesa')}
              disabled={processing}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition ${
                processing
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
              {processing ? 'Processing...' : 'Pay with M-Pesa'}
            </button>

            <button
              onClick={() => handlePayment('card')}
              disabled={processing}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition ${
                processing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
