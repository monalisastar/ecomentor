'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"

export default function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 🧭 Ensure token validity on load
  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.')
      router.push('/login')
    }
  }, [token, router])

  // 🚀 Submit new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        toast.success('Password updated! Redirecting...')
        setTimeout(() => router.push('/login'), 1500)
      } else {
        toast.error(data.error || 'Reset link invalid or expired.')
      }
    } catch (error) {
      setLoading(false)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 p-8 rounded-lg shadow-xl max-w-md w-full backdrop-blur"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-3 rounded bg-white/20 text-white placeholder-white/60 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded bg-white/20 text-white placeholder-white/60 focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-semibold flex justify-center items-center gap-2 transition ${
              loading ? 'bg-green-400/60 cursor-wait' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
