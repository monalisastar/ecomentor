'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', students: 200, revenue: 3200 },
  { month: 'Feb', students: 300, revenue: 4500 },
  { month: 'Mar', students: 400, revenue: 6200 },
  { month: 'Apr', students: 350, revenue: 5000 },
  { month: 'May', students: 500, revenue: 7000 },
  { month: 'Jun', students: 600, revenue: 8200 },
]

export default function ChartCard() {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 mt-6">
      <h2 className="text-lg font-semibold mb-4">Enrollment & Revenue Trends</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '8px', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="students" stroke="#4ade80" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
