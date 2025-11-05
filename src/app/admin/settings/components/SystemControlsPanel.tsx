'use client'

import { Switch } from '@headlessui/react'
import { motion } from 'framer-motion'
import SettingCard from './SettingCard'

interface Props {
  settings: any
  setSettings: (val: any) => void
}

/**
 * ⚙️ SystemControlsPanel
 * ---------------------------------------------------------
 * Manages high-level system toggles such as:
 *  - Maintenance Mode
 *  - Certificate Auto-Verification
 *  - Enrollment Lock
 *  - Email Notifications
 */
export default function SystemControlsPanel({ settings, setSettings }: Props) {
  const toggle = (key: string) =>
    setSettings({ ...settings, [key]: !settings[key] })

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 🧰 Maintenance Mode */}
      <SettingCard
        title="Maintenance Mode"
        description="Temporarily disables access to learners and displays a maintenance message."
      >
        <ToggleSwitch
          enabled={settings.maintenanceMode || false}
          onChange={() => toggle('maintenanceMode')}
        />
      </SettingCard>

      {/* 🎓 Auto-Verify Certificates */}
      <SettingCard
        title="Auto-Verify Certificates"
        description="Automatically marks new certificates as VERIFIED when issued."
      >
        <ToggleSwitch
          enabled={settings.autoVerifyCertificates || false}
          onChange={() => toggle('autoVerifyCertificates')}
        />
      </SettingCard>

      {/* 🧑‍🎓 Enrollment Lock */}
      <SettingCard
        title="Enrollment Lock"
        description="Prevents new course enrollments until manually re-enabled."
      >
        <ToggleSwitch
          enabled={settings.enrollmentLocked || false}
          onChange={() => toggle('enrollmentLocked')}
        />
      </SettingCard>

      {/* 📬 Email Notifications */}
      <SettingCard
        title="Email Notifications"
        description="Send automatic progress and certificate emails to learners."
      >
        <ToggleSwitch
          enabled={settings.emailNotifications || true}
          onChange={() => toggle('emailNotifications')}
        />
      </SettingCard>

      {/* 🔔 Weekly Reports */}
      <SettingCard
        title="Weekly Reports to Admins"
        description="Receive weekly system summaries and course analytics by email."
      >
        <ToggleSwitch
          enabled={settings.weeklyReports || false}
          onChange={() => toggle('weeklyReports')}
        />
      </SettingCard>

      {/* 🚨 Debug Logging */}
      <SettingCard
        title="Enable Debug Logging"
        description="Records extra diagnostic information for developers."
      >
        <ToggleSwitch
          enabled={settings.debugLogging || false}
          onChange={() => toggle('debugLogging')}
        />
      </SettingCard>
    </section>
  )
}

/**
 * 💡 ToggleSwitch
 * Reusable, animated switch built with Headless UI + Framer Motion
 */
function ToggleSwitch({
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
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition`}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        animate={{ x: enabled ? 20 : 2 }}
      />
    </Switch>
  )
}
