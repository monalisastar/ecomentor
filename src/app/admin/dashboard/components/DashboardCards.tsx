'use client'

import { Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react'

interface CardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

function StatCard({ title, value, icon }: CardProps) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 hover:bg-white/20 transition">
      <div>
        <p className="text-sm text-white/70">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-white/10 text-green-400">
        {icon}
      </div>
    </div>
  )
}

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      <StatCard 
        title="Total Students" 
        value="1,245" 
        icon={<Users size={24} />} 
      />
      <StatCard 
        title="Total Courses" 
        value="87" 
        icon={<BookOpen size={24} />} 
      />
      <StatCard 
        title="Active Lecturers" 
        value="32" 
        icon={<GraduationCap size={24} />} 
      />
      <StatCard 
        title="Revenue" 
        value="$12,430" 
        icon={<DollarSign size={24} />} 
      />
    </div>
  )
}
