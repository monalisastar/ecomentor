'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, CartesianGrid } from 'recharts'

interface AnalyticsChartProps {
  data: { date: string; students: number; assignments: number; engagement: number }[]
  title?: string
}

export default function AnalyticsChart({ data, title = 'Dashboard Analytics' }: AnalyticsChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full">
      <h3 className="text-lg font-semibold text-green-800 mb-4">{title}</h3>

      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#16a34a" strokeWidth={2} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="assignments" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="engagement" stroke="#4ade80" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full h-64 md:h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#16a34a" />
            <Bar dataKey="assignments" fill="#22c55e" />
            <Bar dataKey="engagement" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
