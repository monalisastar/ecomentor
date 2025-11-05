'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function StaffSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    bio: '',
    specialization: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // 🧠 Fetch staff settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/staff/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch settings')
        const data = await res.json()
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          specialization: data.specialization || '',
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') fetchSettings()
  }, [status])

  // 📝 Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 💾 Save changes
  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/staff/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      toast.success('Settings updated successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin" /> Loading settings...
      </main>
    )

  return (
    <main className="max-w-3xl mx-auto py-12 space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your profile and system preferences below.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialization
          </label>
          <input
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 outline-none"
            placeholder="e.g. Carbon Accounting, Climate Policy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio / About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 outline-none"
            placeholder="Tell us about your experience or teaching focus..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>
    </main>
  )
}
