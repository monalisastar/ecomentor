'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface StudentProfile {
  name: string
  email: string
  totalEnrollments: number
  totalCertificates: number
}

export function useStudentProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/student/profile', { cache: 'no-store' })
        if (res.status === 401) return router.push('/login')
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return { profile, loading }
}
