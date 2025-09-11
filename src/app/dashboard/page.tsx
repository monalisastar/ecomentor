'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // wait for session
    if (!session?.user) {
      router.replace('/login')
      return
    }

    const role = session.user.role || 'student'

    if (role === 'student') router.replace('/student/dashboard')
    else if (role === 'staff') router.replace('/staff/dashboard')
    else if (role === 'admin') router.replace('/admin/dashboard')
    else router.replace('/')
  }, [session, status, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      <span className="ml-4 text-lg">Redirecting...</span>
    </div>
  )
}
