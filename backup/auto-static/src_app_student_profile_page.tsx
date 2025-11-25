'use client'

import ProfileHeader from './components/ProfileHeader'
import ProfileStats from './components/ProfileStats'
import ProfileLoader from './components/ProfileLoader'
import { useStudentProfile } from './hooks/useStudentProfile'

export default function StudentProfilePage() {
  const { profile, loading } = useStudentProfile()

  if (loading) return <ProfileLoader />
  if (!profile)
    return <p className="text-center mt-10 text-gray-500">No profile data.</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Profile 🌱</h1>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <ProfileHeader name={profile.name} email={profile.email} />
        <ProfileStats
          totalEnrollments={profile.totalEnrollments}
          totalCertificates={profile.totalCertificates}
        />
      </div>
    </div>
  )
}
