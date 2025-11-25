'use client'

import { Users, Download } from 'lucide-react'
import StudentTable from './components/StudentTable'

export default function StudentsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50 p-6 space-y-8 mt-4">
      {/* 🧭 Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-gray-600 text-sm">
              Track student progress, view profiles, and manage enrollments.
            </p>
          </div>
        </div>

        {/* 📤 Export Button */}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Download size={16} />
          Export List
        </button>
      </div>

      {/* 🧾 Table Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <StudentTable />
      </section>
    </div>
  )
}
