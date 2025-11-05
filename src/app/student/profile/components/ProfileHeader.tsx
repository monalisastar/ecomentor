import { Mail, User } from 'lucide-react'

export default function ProfileHeader({ name, email }: { name: string; email: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <User className="text-green-600" />
        <div>
          <p className="text-xs text-gray-500">Full Name</p>
          <p className="text-lg font-medium">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="text-blue-600" />
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-lg font-medium">{email}</p>
        </div>
      </div>
    </div>
  )
}
