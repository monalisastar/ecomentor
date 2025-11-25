'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import GeneralSettingsPanel from './components/GeneralSettingsPanel'
import CertificateDefaultsPanel from './components/CertificateDefaultsPanel'
import SystemControlsPanel from './components/SystemControlsPanel'

/**
 * ⚙️ Admin Settings Dashboard
 * ---------------------------------------------------------
 * Centralized admin panel for:
 *  - General platform branding & info
 *  - Certificate defaults & appearance
 *  - System control toggles
 */
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  //
  // 🧠 Load Settings from Backend
  //
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load settings')

      const data = await res.json()

      // 🧩 Ensure all keys exist (avoids undefined switches)
      const defaults = {
        platformName: '',
        supportEmail: '',
        brandColor: '#1B5E20',
        defaultLanguage: 'en',
        issuerName: 'Eco-Mentor Climate LMS',
        verifiedBy: 'Administrator',
        logoUrl: '',
        signatureUrl: '',
        backgroundUrl: '',
        certificateColor: '#1B5E20',
        autoVerifyCertificates: false,
        blockchainMintingEnabled: false,
        maintenanceMode: false,
        enrollmentLocked: false,
        emailNotifications: true,
        weeklyReports: false,
        debugLogging: false,
      }

      setSettings({ ...defaults, ...data })
    } catch (err: any) {
      toast.error(err.message || 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  //
  // 💾 Save Settings to Backend
  //
  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save settings')

      toast.success('✅ Settings saved successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  //
  // ⏳ Loading UI
  //
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p>Loading admin settings...</p>
      </div>
    )

  //
  // 🎨 Main Layout
  //
  return (
    <main className="p-6 pt-[88px] space-y-8">
      {/* 🧭 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage platform preferences, certificate layouts, and system toggles.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-white transition-all ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* 🧩 Settings Panels */}
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            🌍 General & Branding
          </h2>
          <GeneralSettingsPanel settings={settings} setSettings={setSettings} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            🪶 Certificate Defaults
          </h2>
          <CertificateDefaultsPanel settings={settings} setSettings={setSettings} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            ⚙️ System Controls
          </h2>
          <SystemControlsPanel settings={settings} setSettings={setSettings} />
        </section>
      </div>
    </main>
  )
}
