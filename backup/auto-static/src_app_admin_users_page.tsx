'use client'

import { useEffect, useState } from 'react'
import { Loader2, Download, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  roles: string[]
  status: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const usersPerPage = 10

  // 🧠 Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 📄 Pagination
  const totalPages = Math.ceil(users.length / usersPerPage)
  const displayedUsers = users.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  )

  // 🧾 Export to CSV
  const exportToCSV = () => {
    const header = ['Name', 'Email', 'Role', 'Status']
    const rows = users.map((u) => [u.name, u.email, u.roles.join(', '), u.status])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eco-mentor-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // 🧾 Export to PDF
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()
    doc.text('Eco-Mentor User List', 14, 15)
    autoTable(doc, {
      startY: 25,
      head: [['Name', 'Email', 'Role', 'Status']],
      body: users.map((u) => [
        u.name || 'Unnamed',
        u.email,
        u.roles.join(', '),
        u.status,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [27, 67, 50] }, // Eco-Mentor green
    })
    doc.save(`eco-mentor-users-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // ⚙️ Confirm + Toggle user status
  const confirmToggle = (user: User) => {
    setConfirmUser(user)
  }

  const handleToggleConfirmed = async () => {
    if (!confirmUser) return
    const newStatus = confirmUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'

    try {
      const res = await fetch(`/api/admin/users/${confirmUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(
          `User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`
        )
        setConfirmUser(null)
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update user')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // 🗑️ Delete suspended user
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}?`)) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete user')
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <main className="p-6 pt-[88px] flex flex-col gap-6 relative">
      {/* 🧭 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* 📊 Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  <Loader2 className="animate-spin inline-block mr-2" />
                  Loading users...
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400 italic">
                  No users found
                </td>
              </tr>
            ) : (
              displayedUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name || 'Unnamed User'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.roles.join(', ')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : u.status === 'INVITED'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  {/* 🧍‍♂️ Actions */}
                  <td className="px-4 py-3 flex gap-2">
                    {u.roles.includes('student') ? (
                      <span className="text-gray-400 italic text-xs">Always Active</span>
                    ) : u.email === 'njatabrian648@gmail.com' ||
                      u.email === 'virginia.njata@gmail.com' ? (
                      <span className="text-gray-400 italic text-xs">Protected Admin</span>
                    ) : (
                      <>
                        <button
                          onClick={() => confirmToggle(u)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>

                        {u.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📑 Pagination */}
      {!loading && users.length > 10 && (
        <div className="flex justify-between items-center text-sm mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md ${
              page === 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Previous
          </button>
          <p className="text-gray-600">
            Page {page} of {totalPages}
          </p>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md ${
              page === totalPages
                ? 'bg-gray-200 text-gray-400'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ⚠️ Confirmation Modal */}
      {confirmUser && !confirmUser.roles.includes('student') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <AlertTriangle className="text-yellow-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">
              Confirm {confirmUser.status === 'ACTIVE' ? 'Suspension' : 'Activation'}
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to{' '}
              {confirmUser.status === 'ACTIVE' ? 'suspend' : 'activate'}{' '}
              <span className="font-medium text-gray-800">{confirmUser.name}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleToggleConfirmed}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmUser.status === 'ACTIVE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmUser(null)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
