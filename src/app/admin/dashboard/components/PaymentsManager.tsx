'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { DollarSign, RefreshCcw, ArrowDownCircle } from 'lucide-react'

interface Payment {
  id: string
  student: string
  course: string
  amount: number
  status: 'completed' | 'pending' | 'refunded'
  date: string
  lecturer: string
}

const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    student: 'John Doe',
    course: 'Climate Science 101',
    amount: 50,
    status: 'completed',
    date: '2025-09-05',
    lecturer: 'Dr. Green',
  },
  {
    id: 'pay-002',
    student: 'Jane Smith',
    course: 'Carbon Accounting',
    amount: 75,
    status: 'pending',
    date: '2025-09-04',
    lecturer: 'Prof. Blue',
  },
]

export default function PaymentsManager() {
  const [payments, setPayments] = useState(mockPayments)

  const handleRefund = (id: string) => {
    setPayments(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'refunded' } : p
      )
    )
  }

  const handlePayout = (id: string) => {
    alert(`Payout triggered for lecturer of transaction ${id}`)
  }

  return (
    <motion.div
      className="p-6 rounded-2xl glass-card shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Payments Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="text-left border-b border-white/20">
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Course</th>
                  <th className="px-4 py-2">Lecturer</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="px-4 py-2">{p.student}</td>
                    <td className="px-4 py-2">{p.course}</td>
                    <td className="px-4 py-2">{p.lecturer}</td>
                    <td className="px-4 py-2 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-300" />
                      {p.amount} USD
                    </td>
                    <td className="px-4 py-2">
                      {p.status === 'completed' && (
                        <span className="text-green-400 font-semibold">Completed</span>
                      )}
                      {p.status === 'pending' && (
                        <span className="text-yellow-300 font-semibold">Pending</span>
                      )}
                      {p.status === 'refunded' && (
                        <span className="text-red-400 font-semibold">Refunded</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{p.date}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {p.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/80 hover:bg-red-600 text-white"
                          onClick={() => handleRefund(p.id)}
                        >
                          <RefreshCcw className="w-4 h-4 mr-1" />
                          Refund
                        </Button>
                      )}
                      {p.status === 'completed' && (
                        <Button
                          size="sm"
                          className="bg-blue-500/80 hover:bg-blue-600 text-white"
                          onClick={() => handlePayout(p.id)}
                        >
                          <ArrowDownCircle className="w-4 h-4 mr-1" />
                          Payout
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
