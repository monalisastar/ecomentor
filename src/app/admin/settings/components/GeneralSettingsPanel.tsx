'use client'

import SettingCard from './SettingCard'

interface Props {
  settings: any
  setSettings: (val: any) => void
}

/**
 * 🌍 GeneralSettingsPanel
 * ---------------------------------------------------------
 * Handles platform-level details like name, contact email,
 * and branding options. Connected to admin settings state.
 */
export default function GeneralSettingsPanel({ settings, setSettings }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingCard
        title="Platform Name"
        description="Displayed across certificates, emails, and page titles."
      >
        <input
          type="text"
          value={settings.platformName || ''}
          onChange={(e) =>
            setSettings({ ...settings, platformName: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-600 focus:outline-none"
        />
      </SettingCard>

      <SettingCard
        title="Support Email"
        description="Used for notifications, helpdesk, and contact links."
      >
        <input
          type="email"
          value={settings.supportEmail || ''}
          onChange={(e) =>
            setSettings({ ...settings, supportEmail: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-600 focus:outline-none"
        />
      </SettingCard>

      <SettingCard
        title="Primary Brand Color"
        description="The main color used for UI elements and certificates."
      >
        <input
          type="color"
          value={settings.brandColor || '#1B5E20'}
          onChange={(e) =>
            setSettings({ ...settings, brandColor: e.target.value })
          }
          className="h-10 w-16 rounded-md cursor-pointer border border-gray-200"
        />
      </SettingCard>

      <SettingCard
        title="Default Language"
        description="The default language for user interface and certificates."
      >
        <select
          value={settings.defaultLanguage || 'en'}
          onChange={(e) =>
            setSettings({ ...settings, defaultLanguage: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-green-600 focus:outline-none"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="sw">Swahili</option>
        </select>
      </SettingCard>
    </section>
  )
}
