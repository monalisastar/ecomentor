'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Shield, Palette, Save, Upload } from 'lucide-react'

export default function SettingsPanel() {
  const [platformName, setPlatformName] = useState('Climate LMS')
  const [theme, setTheme] = useState<'light' | 'dark' | 'glass'>('glass')
  const [logo, setLogo] = useState<File | null>(null)
  const [twoFactor, setTwoFactor] = useState(true)

  const handleSave = () => {
    alert(`Settings saved:\nName: ${platformName}\nTheme: ${theme}\n2FA: ${twoFactor}`)
  }

  return (
    <motion.div
      className="p-6 rounded-2xl glass-card shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-300" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Name */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
              className="w-full p-2 rounded-md bg-white/20 text-white placeholder-white/60 focus:outline-none"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Platform Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogo(e.target.files?.[0] || null)}
              className="text-white/70"
            />
            {logo && (
              <p className="text-xs text-green-300 mt-1">
                Uploaded: {logo.name}
              </p>
            )}
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-white/80 text-sm mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Theme
            </label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'glass')}
              className="w-full p-2 rounded-md bg-white/20 text-white focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="glass">Glassmorphism</option>
            </select>
          </div>

          {/* Security */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Enable Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={e => setTwoFactor(e.target.checked)}
              className="w-5 h-5"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="bg-green-500/80 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
