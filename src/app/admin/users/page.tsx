'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  name: string
  email: string
  role: 'Student' | 'Lecturer' | 'Admin'
  status: 'Active' | 'Suspended'
  joined: string
}

export default function UsersPage() {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Student', status: 'Active', joined: '2025-01-10' },
    { id: 2, name: 'David Kim', email: 'david@example.com', role: 'Lecturer', status: 'Active', joined: '2025-02-05' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Suspended', joined: '2025-03-15' },
  ])

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'All' | 'Student' | 'Lecturer' | 'Admin'>('All')

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (selectedUser) {
      setUsers(users.map(u => (u.id === selectedUser.id ? selectedUser : u)))
    }
    setIsEditing(false)
  }

  const handleAdd = (newUser: User) => {
    setUsers([...users, { ...newUser, id: users.length + 1 }])
    setIsAdding(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'All' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 Manage Users</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg shadow-lg"
          >
            + Add New User
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-lg"
          >
            ⬅ Return to Dashboard
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-1/2 p-2 rounded bg-gray-800 text-white"
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as any)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="All">All Roles</option>
          <option value="Student">Students</option>
          <option value="Lecturer">Lecturers</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/10 text-gray-300 uppercase text-sm">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-white/5">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs ${
                      user.status === 'Active' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-4">{user.joined}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <input
              type="text"
              value={selectedUser.name}
              onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
              placeholder="Name"
            />
            <input
              type="email"
              value={selectedUser.email}
              onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
              placeholder="Email"
            />
            <select
              value={selectedUser.role}
              onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value as User['role'] })}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
            >
              <option>Student</option>
              <option>Lecturer</option>
              <option>Admin</option>
            </select>
            <select
              value={selectedUser.status}
              onChange={e => setSelectedUser({ ...selectedUser, status: e.target.value as User['status'] })}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
            >
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1 bg-green-600 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <UserForm
              onSubmit={(newUser) => handleAdd(newUser)}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Small form component inside the same file
function UserForm({ onSubmit, onCancel }: { onSubmit: (user: User) => void; onCancel: () => void }) {
  const [form, setForm] = useState<User>({
    id: 0,
    name: '',
    email: '',
    role: 'Student',
    status: 'Active',
    joined: new Date().toISOString().split('T')[0],
  })

  return (
    <>
      <input
        type="text"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
        placeholder="Name"
      />
      <input
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
        placeholder="Email"
      />
      <select
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value as User['role'] })}
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
      >
        <option>Student</option>
        <option>Lecturer</option>
        <option>Admin</option>
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 bg-gray-700 rounded-lg">Cancel</button>
        <button onClick={() => onSubmit(form)} className="px-3 py-1 bg-green-600 rounded-lg">Add</button>
      </div>
    </>
  )
}
