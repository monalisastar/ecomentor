'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const mockData = [
  { month: 'Jan', enrollments: 120, revenue: 2400 },
  { month: 'Feb', enrollments: 98, revenue: 2000 },
  { month: 'Mar', enrollments: 150, revenue: 3200 },
  { month: 'Apr', enrollments: 130, revenue: 2800 },
  { month: 'May', enrollments: 170, revenue: 4000 },
  { month: 'Jun', enrollments: 190, revenue: 4600 },
  { month: 'Jul', enrollments: 210, revenue: 5000 },
]

export default function AnalyticsChart() {
  return (
    <motion.div
      className="p-6 rounded-2xl glass-card shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px]">
            <ResponsiveContainer>
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#4ade80"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
