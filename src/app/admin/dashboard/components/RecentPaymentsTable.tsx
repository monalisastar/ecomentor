'use client'

interface Payment {
  id: number
  student: string
  course: string
  amount: string
  status: 'Paid' | 'Pending' | 'Refunded'
  date: string
}

const recentPayments: Payment[] = [
  { id: 1, student: 'Alice Johnson', course: 'Intro to Climate Science', amount: '$120', status: 'Paid', date: '2025-09-03' },
  { id: 2, student: 'Michael Kim', course: 'Carbon Accounting 101', amount: '$90', status: 'Pending', date: '2025-09-02' },
  { id: 3, student: 'Sophia Wang', course: 'Sustainable Energy Solutions', amount: '$150', status: 'Refunded', date: '2025-08-31' },
]

export default function RecentPaymentsTable() {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-white/70 border-b border-white/10">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 px-4 font-medium">{payment.student}</td>
                <td className="py-3 px-4">{payment.course}</td>
                <td className="py-3 px-4">{payment.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${payment.status === 'Paid' ? 'bg-green-500/20 text-green-400' : ''}
                      ${payment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${payment.status === 'Refunded' ? 'bg-red-500/20 text-red-400' : ''}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4">{payment.date}</td>
                <td className="py-3 px-4">
                  {payment.status === 'Pending' && (
                    <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 mr-2">
                      Confirm
                    </button>
                  )}
                  {payment.status === 'Paid' && (
                    <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
