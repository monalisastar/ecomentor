"use client"

import { CourseBuilder } from "./CourseBuilder"

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white py-10">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-sky-800">
          Create a New Course
        </h1>
        <CourseBuilder />
      </div>
    </div>
  )
}
