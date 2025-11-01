'use client'

type LearningHeaderProps = {
  totalCourses?: number
  averageProgress?: number
}

export default function LearningHeader({
  totalCourses = 0,
  averageProgress = 0,
}: LearningHeaderProps) {
  return (
    <div className="space-y-3 text-center md:text-left">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Learning 🌱
        </h1>
        <p className="text-gray-600">
          Pick up where you left off and review what you’ve learned.
        </p>
      </div>

      {/* 📊 Optional Stats */}
      {totalCourses > 0 && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mt-2">
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
            Enrolled Courses: <strong>{totalCourses}</strong>
          </span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            Avg. Progress: <strong>{averageProgress}%</strong>
          </span>
        </div>
      )}
    </div>
  )
}
