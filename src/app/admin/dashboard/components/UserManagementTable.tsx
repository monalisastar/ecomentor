'use client'

interface User {
  id: number
  name: string
  email: string
  role: 'Student' | 'Lecturer' | 'Admin'
  status: 'Active' | 'Suspended' | 'Pending'
}

const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Student', status: 'Active' },
  { id: 2, name: 'Dr. Michael Kim', email: 'm.kim@example.com', role: 'Lecturer', status: 'Pending' },
  { id: 3, name: 'Sophia Wang', email: 'sophia@example.com', role: 'Student', status: 'Suspended' },
  { id: 4, name: 'Admin James', email: 'admin@example.com', role: 'Admin', status: 'Active' },
]

export default function UserManagementTable() {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 mt-6">
      <h2 className="text-lg font-semibold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-white/70 border-b border-white/10">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 px-4 font-medium">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'Student' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${user.role === 'Lecturer' ? 'bg-purple-500/20 text-purple-400' : ''}
                      ${user.role === 'Admin' ? 'bg-green-500/20 text-green-400' : ''}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${user.status === 'Active' ? 'bg-green-500/20 text-green-400' : ''}
                      ${user.status === 'Suspended' ? 'bg-red-500/20 text-red-400' : ''}
                      ${user.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {user.status !== 'Active' && (
                    <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                      Activate
                    </button>
                  )}
                  {user.status === 'Active' && (
                    <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                      Suspend
                    </button>
                  )}
                  {user.role === 'Student' && (
                    <button className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">
                      Promote to Lecturer
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
