'use client'

import { useState, useEffect, useContext } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { getTransactions, requestLecturerPayout } from '@/services/api/payments'
import { SocketContext } from '@/context/SocketProvider'

type Payment = {
  id: number
  student: string
  lecturer: string
  course: string
  amount: number
  status: 'Completed' | 'Pending' | 'Refunded'
  date: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const socket = useContext(SocketContext)

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      const data = await getTransactions()
      setPayments(data)
    } catch (err) {
      console.error('Failed to fetch payments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()

    // Listen for real-time updates
    if (socket) {
      socket.on('payment_updated', (updatedPayment: Payment) => {
        setPayments(prev =>
          prev.map(p => (p.id === updatedPayment.id ? updatedPayment : p))
        )
      })

      socket.on('new_payment', (newPayment: Payment) => {
        setPayments(prev => [newPayment, ...prev])
      })

      socket.on('payout_processed', ({ lecturer, amount }: { lecturer: string; amount: number }) => {
        // Optional: show a notification or update UI
        fetchPayments()
      })
    }

    return () => {
      socket?.off('payment_updated')
      socket?.off('new_payment')
      socket?.off('payout_processed')
    }
  }, [socket])

  const filteredPayments = payments.filter(
    p =>
      p.student.toLowerCase().includes(search.toLowerCase()) ||
      p.lecturer.toLowerCase().includes(search.toLowerCase()) ||
      p.course.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = payments.reduce(
    (sum, p) => sum + (p.status === 'Completed' ? p.amount : 0),
    0
  )
  const pending = payments.filter(p => p.status === 'Pending').length
  const refunded = payments.filter(p => p.status === 'Refunded').length

  // Lecturer payouts: 70% of completed payments
  const lecturerPayouts = Array.from(
    filteredPayments.reduce((map, p) => {
      if (p.status === 'Completed') {
        map.set(p.lecturer, (map.get(p.lecturer) || 0) + p.amount * 0.7)
      }
      return map
    }, new Map<string, number>())
  )

  const handleMarkCompleted = async (id: number) => {
    try {
      await fetch(`/api/payments/${id}/complete`, { method: 'POST' })
      fetchPayments()
      socket?.emit('payment_updated', { id })
    } catch (err) {
      console.error('Failed to mark completed', err)
    }
  }

  const handleRefund = async (id: number) => {
    try {
      await fetch(`/api/payments/${id}/refund`, { method: 'POST' })
      fetchPayments()
      socket?.emit('payment_updated', { id })
    } catch (err) {
      console.error('Failed to refund', err)
    }
  }

  const handlePayout = async (lecturer: string, method: 'PayPal' | 'Crypto', amount: number) => {
    try {
      await requestLecturerPayout({ lecturerId: lecturer, amount, paymentMethod: method })
      alert(`Payout of $${amount} to ${lecturer} via ${method} executed!`)
      socket?.emit('payout_processed', { lecturer, amount })
      fetchPayments()
    } catch (err) {
      console.error('Failed to process payout', err)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Student', 'Lecturer', 'Course', 'Amount', 'Status', 'Date']
    const rows = filteredPayments.map(p => [p.id, p.student, p.lecturer, p.course, p.amount, p.status, p.date])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments.csv'
    a.click()
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text('Payments Report', 14, 16)
    doc.autoTable({
      startY: 20,
      head: [['ID', 'Student', 'Lecturer', 'Course', 'Amount', 'Status', 'Date']],
      body: filteredPayments.map(p => [p.id, p.student, p.lecturer, p.course, `$${p.amount}`, p.status, p.date]),
    })
    doc.save('payments.pdf')
  }

  if (loading) return <p className="text-white p-6">Loading payments...</p>

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-center">
          <h2 className="text-sm">Total Revenue</h2>
          <p className="text-2xl font-bold">${totalRevenue}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-center">
          <h2 className="text-sm">Pending Payments</h2>
          <p className="text-2xl font-bold">{pending}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-center">
          <h2 className="text-sm">Refunded</h2>
          <p className="text-2xl font-bold">{refunded}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-center">
          <h2 className="text-sm">Lecturer Payouts</h2>
          <p className="text-2xl font-bold">${lecturerPayouts.reduce((sum, [, amt]) => sum + amt, 0)}</p>
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by student, lecturer, or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-3 rounded-xl bg-white/10 border border-white/20 text-white w-full md:w-1/2"
        />
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Export CSV</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700">Export PDF</button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <table className="w-full text-left text-white">
          <thead className="border-b border-white/20">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Student</th>
              <th className="p-3">Lecturer</th>
              <th className="p-3">Course</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(p => (
              <tr key={p.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.student}</td>
                <td className="p-2">{p.lecturer}</td>
                <td className="p-2">{p.course}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">{p.date}</td>
                <td className="p-2 flex gap-2">
                  {p.status === 'Pending' && (
                    <button
                      onClick={() => handleMarkCompleted(p.id)}
                      className="px-2 py-1 bg-green-600 rounded-lg text-sm hover:bg-green-700"
                    >
                      Mark Completed
                    </button>
                  )}
                  {p.status !== 'Refunded' && (
                    <button
                      onClick={() => handleRefund(p.id)}
                      className="px-2 py-1 bg-red-600 rounded-lg text-sm hover:bg-red-700"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lecturer Payouts */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Lecturer Payouts</h2>
        {lecturerPayouts.length === 0 ? (
          <p>No payouts due.</p>
        ) : (
          lecturerPayouts.map(([lecturer, amount]) => (
            <div key={lecturer} className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
              <span>{lecturer}</span>
              <div className="flex gap-2 items-center">
                <span>${amount}</span>
                <button
                  onClick={() => handlePayout(lecturer, 'PayPal', amount)}
                  className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                >
                  PayPal
                </button>
                <button
                  onClick={() => handlePayout(lecturer, 'Crypto', amount)}
                  className="px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm"
                >
                  Crypto
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
