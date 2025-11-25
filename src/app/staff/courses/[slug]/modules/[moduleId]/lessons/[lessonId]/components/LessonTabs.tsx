'use client'

import { Button } from '@/components/ui/button'
import { LayoutGrid, UploadCloud, FileText, HelpCircle } from 'lucide-react'

interface LessonTabsProps {
  activeTab: 'overview' | 'uploads' | 'content' | 'quiz'
  setActiveTab: (tab: 'overview' | 'uploads' | 'content' | 'quiz') => void
}

export default function LessonTabs({ activeTab, setActiveTab }: LessonTabsProps) {
  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid },
    { key: 'uploads', label: 'Uploads', icon: UploadCloud },
    { key: 'content', label: 'Content', icon: FileText },
    { key: 'quiz', label: 'Quizzes', icon: HelpCircle },
  ] as const

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key
        return (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            variant={isActive ? 'default' : 'outline'}
            className={`flex items-center gap-2 ${
              isActive
                ? 'bg-green-700 text-white'
                : 'bg-white/10 text-gray-200 border-white/20 hover:bg-white/20'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </Button>
        )
      })}
    </div>
  )
}
