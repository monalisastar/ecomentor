'use client'

interface Course {
  id: number
  title: string
  lecturer: string
  status: 'Pending' | 'Published' | 'Draft'
  date: string
}

const recentCourses: Course[] = [
  { id: 1, title: 'Intro to Climate Science', lecturer: 'Dr. Amina Yusuf', status: 'Pending', date: '2025-09-01' },
  { id: 2, title: 'Carbon Accounting 101', lecturer: 'Prof. John Mwangi', status: 'Published', date: '2025-08-28' },
  { id: 3, title: 'Sustainable Energy Solutions', lecturer: 'Dr. Grace Lee', status: 'Draft', date: '2025-08-25' },
]

export default function RecentCoursesTable() {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Courses</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-white/70 border-b border-white/10">
              <th className="py-3 px-4">Course Title</th>
              <th className="py-3 px-4">Lecturer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentCourses.map((course) => (
              <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 px-4 font-medium">{course.title}</td>
                <td className="py-3 px-4">{course.lecturer}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${course.status === 'Published' ? 'bg-green-500/20 text-green-400' : ''}
                      ${course.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${course.status === 'Draft' ? 'bg-gray-500/20 text-gray-400' : ''}`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="py-3 px-4">{course.date}</td>
                <td className="py-3 px-4">
                  <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 mr-2">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
