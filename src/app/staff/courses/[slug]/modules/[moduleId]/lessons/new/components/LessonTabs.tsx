'use client'

interface LessonTabsProps {
  activeTab: 'info' | 'resources' | 'quiz'
  setActiveTab: (tab: 'info' | 'resources' | 'quiz') => void
}

export default function LessonTabs({ activeTab, setActiveTab }: LessonTabsProps) {
  const tabs = [
    { id: 'info', label: 'Lesson Info' },
    { id: 'resources', label: 'Resources' },
    { id: 'quiz', label: 'Quiz' },
  ]

  return (
    <div className="flex justify-center mb-4 space-x-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
