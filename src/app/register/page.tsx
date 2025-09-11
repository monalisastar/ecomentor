'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      toast.success('Registration successful!')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black">
      <Image
        src="/images/register-bg.jpg"
        alt="Register Background"
        fill
        className="object-cover opacity-50"
        priority
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md rounded-xl shadow-lg p-8 text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Eco-Mentor Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-white/80 text-black placeholder-gray-600 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-white/80 text-black placeholder-gray-600 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-white/80 text-black placeholder-gray-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm mb-2">Or sign in with</p>
          <button
            onClick={() => (window.location.href = '/api/auth/signin')}
            className="w-full bg-white text-black font-medium py-2 rounded-md shadow hover:bg-gray-200 transition"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="underline text-white hover:text-green-200">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  )
}

