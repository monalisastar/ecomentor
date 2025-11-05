'use client'

import { useEffect, useState } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AddStaffModal from './components/AddStaffModal'

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // 🧠 Fetch staff
  async function fetchStaff() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const data = await res.json()
      setStaff(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ⚡ Toggle status
  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus =
      currentStatus === 'INVITED'
        ? 'ACTIVE'
        : currentStatus === 'ACTIVE'
        ? 'SUSPENDED'
        : 'ACTIVE'

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Status changed to ${nextStatus}`)
      fetchStaff()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  return (
    <div className="p-4">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
        >
          <PlusCircle size={18} />
          Add Staff
        </button>
      </div>

      {/* 🔹 Staff Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading staff...
        </div>
      ) : staff.length === 0 ? (
        <p className="text-gray-600 text-sm">No staff members found.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-green-700 text-white text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.roles?.[0]}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'INVITED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {user.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔹 Add Staff Modal */}
      {modalOpen && (
        <AddStaffModal
          onClose={() => setModalOpen(false)}
          onAdded={() => fetchStaff()}
        />
      )}
    </div>
  )
}
