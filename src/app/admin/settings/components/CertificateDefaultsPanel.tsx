'use client'

import SettingCard from './SettingCard'
import UploadPanel from '@/components/UploadPanel' // adjust import path to your actual location

interface Props {
  settings: any
  setSettings: (val: any) => void
}

/**
 * 🪶 CertificateDefaultsPanel
 * ---------------------------------------------------------
 * Manages default values for certificate appearance:
 * issuer name, signature, logo, background, and color.
 * Uses UploadPanel for Supabase image uploads.
 */
export default function CertificateDefaultsPanel({ settings, setSettings }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 🏛️ Issuer */}
      <SettingCard
        title="Issuer Name"
        description="Displayed as the issuer name on all generated certificates."
      >
        <input
          type="text"
          value={settings.issuerName || 'Eco-Mentor Climate LMS'}
          onChange={(e) =>
            setSettings({ ...settings, issuerName: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-600 focus:outline-none"
        />
      </SettingCard>

      {/* 🖋️ Verified By */}
      <SettingCard
        title="Verified By (Default)"
        description="Default signature name that appears on verified certificates."
      >
        <input
          type="text"
          value={settings.verifiedBy || 'Administrator'}
          onChange={(e) =>
            setSettings({ ...settings, verifiedBy: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-600 focus:outline-none"
        />
      </SettingCard>

      {/* 🖼️ Certificate Logo */}
      <SettingCard
        title="Certificate Logo"
        description="Displayed at the top of all certificates."
      >
        <UploadPanel
          fixedContext="certificate-assets"
          fileType="image"
          multiple={false}
          initialUrls={settings.logoUrl ? [settings.logoUrl] : []}
          onUploaded={(files) =>
            setSettings({ ...settings, logoUrl: files[0]?.url })
          }
        />
      </SettingCard>

      {/* ✍️ Signature Image */}
      <SettingCard
        title="Signature Image"
        description="Digital signature image for the bottom-right of certificates."
      >
        <UploadPanel
          fixedContext="certificate-signatures"
          fileType="image"
          multiple={false}
          initialUrls={settings.signatureUrl ? [settings.signatureUrl] : []}
          onUploaded={(files) =>
            setSettings({ ...settings, signatureUrl: files[0]?.url })
          }
        />
      </SettingCard>

      {/* 🧱 Background Image */}
      <SettingCard
        title="Background Image"
        description="Optional background or watermark for certificates."
      >
        <UploadPanel
          fixedContext="certificate-backgrounds"
          fileType="image"
          multiple={false}
          initialUrls={settings.backgroundUrl ? [settings.backgroundUrl] : []}
          onUploaded={(files) =>
            setSettings({ ...settings, backgroundUrl: files[0]?.url })
          }
        />
      </SettingCard>

      {/* 🎨 Accent Color */}
      <SettingCard
        title="Accent Color"
        description="Color used for borders, text, and certificate highlights."
      >
        <input
          type="color"
          value={settings.certificateColor || '#1B5E20'}
          onChange={(e) =>
            setSettings({ ...settings, certificateColor: e.target.value })
          }
          className="h-10 w-16 rounded-md cursor-pointer border border-gray-200"
        />
      </SettingCard>
    </section>
  )
}
