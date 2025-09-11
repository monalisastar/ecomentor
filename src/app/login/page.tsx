'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { signIn, useSession } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const specialEmails = [
    'njatabrian648@gmail.com',
    'virginia.njata@gmail.com',
    'trizer.trio56@gmail.com',
  ]

  // 🔑 Redirect if authenticated safely
  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role || 'student' // fallback role
      router.replace(`/${role}/dashboard`)
    }
  }, [session, status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 🚨 Special bypass
      if (specialEmails.includes(email)) {
        toast.success('Bypass login active ✅')
        const role =
          prompt('Enter role: student, staff, admin', 'staff')?.toLowerCase() ||
          'staff'

        // Optional: call backend to set role
        try {
          await fetch('/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role }),
          })
        } catch (err) {
          console.warn('Bypass set-role API failed:', err)
        }

        router.replace(`/${role}/dashboard`)
        return
      }

      // ✅ Normal NextAuth login
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Logged in successfully!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex justify-center items-center"
      style={{ backgroundImage: 'url("/register-bg.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
            Sign In to Eco-Mentor
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? 'bg-green-400/60 cursor-wait'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => signIn('google')}
              className="w-full py-3 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white mt-3"
            >
              Sign in with Google
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-white/70">
            Don’t have an account?{' '}
            <a href="/register" className="text-green-400 hover:underline">
              Register
            </a>
          </p>

          {status === 'loading' && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
