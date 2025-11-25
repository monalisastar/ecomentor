'use client'

import SettingCard from './SettingCard'
import UploadPanel, { UploadedFile } from '@/components/UploadPanel'
import { Switch } from '@headlessui/react'
import { motion } from 'framer-motion'

interface Props {
  settings: any
  setSettings: (val: any) => void
}

/**
 * 🪶 CertificateDefaultsPanel
 * ---------------------------------------------------------
 * Manages certificate appearance + automation settings:
 * issuer, visuals, auto-verification, and blockchain minting.
 */
export default function CertificateDefaultsPanel({ settings, setSettings }: Props) {
  const handleToggle = (key: string) =>
    setSettings({ ...settings, [key]: !settings[key] })

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

      {/* 🖼️ Logo */}
      <SettingCard
        title="Certificate Logo"
        description="Displayed at the top of all certificates."
      >
        <UploadPanel
          fixedContext="certificate-assets"
          fileType="image"
          multiple={false}
          fileUrl={settings.logoUrl || null}
          onUploaded={(files: UploadedFile[], fileUrl?: string) =>
            setSettings({ ...settings, logoUrl: fileUrl || files[0]?.url })
          }
          onDelete={async () => setSettings({ ...settings, logoUrl: null })}
        />
      </SettingCard>

      {/* ✍️ Signature */}
      <SettingCard
        title="Signature Image"
        description="Digital signature image for the bottom-right of certificates."
      >
        <UploadPanel
          fixedContext="certificate-signatures"
          fileType="image"
          multiple={false}
          fileUrl={settings.signatureUrl || null}
          onUploaded={(files: UploadedFile[], fileUrl?: string) =>
            setSettings({ ...settings, signatureUrl: fileUrl || files[0]?.url })
          }
          onDelete={async () => setSettings({ ...settings, signatureUrl: null })}
        />
      </SettingCard>

      {/* 🧱 Background */}
      <SettingCard
        title="Background Image"
        description="Optional background or watermark for certificates."
      >
        <UploadPanel
          fixedContext="certificate-backgrounds"
          fileType="image"
          multiple={false}
          fileUrl={settings.backgroundUrl || null}
          onUploaded={(files: UploadedFile[], fileUrl?: string) =>
            setSettings({ ...settings, backgroundUrl: fileUrl || files[0]?.url })
          }
          onDelete={async () => setSettings({ ...settings, backgroundUrl: null })}
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

      {/* ✅ Auto-Verify Certificates */}
      <SettingCard
        title="Auto-Verify Certificates"
        description="Automatically mark new certificates as verified when issued."
      >
        <AnimatedToggle
          enabled={settings.autoVerifyCertificates || false}
          onChange={() => handleToggle('autoVerifyCertificates')}
        />
      </SettingCard>

      {/* 🪙 Blockchain Minting */}
      <SettingCard
        title="Blockchain Minting"
        description="Automatically mint verified certificates as NFTs on Polygon."
      >
        <AnimatedToggle
          enabled={settings.blockchainMintingEnabled || false}
          onChange={() => handleToggle('blockchainMintingEnabled')}
        />
      </SettingCard>
    </section>
  )
}

/**
 * 💡 AnimatedToggle
 * ---------------------------------------------------------
 * Reusable, animated toggle switch using Headless UI + Framer Motion.
 */
function AnimatedToggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <Switch
      checked={enabled}
      onChange={onChange}
      className={`${
        enabled ? 'bg-green-600' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
    >
      <span className="sr-only">Toggle setting</span>
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        animate={{ x: enabled ? 20 : 2 }}
      />
    </Switch>
  )
}
