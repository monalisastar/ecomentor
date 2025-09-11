import { courseData, Course } from "./courseData"

// New type extends base Course
export interface EnhancedCourse extends Course {
  id: string           // ✅ unique ID for each course
  progress?: number    // ✅ progress percentage (0–100)
  rating?: number
  enrollments?: number
  isNew?: boolean
  popular?: boolean
  recommended?: boolean
  createdAt?: string
  duration?: string    // course duration
}

// Generate enhanced data dynamically
export const enhancedCourses: EnhancedCourse[] = courseData.map((c, i) => ({
  ...c,
  id: c.slug || `course-${i}`,                   // ✅ use slug or fallback
  progress: Math.floor(Math.random() * 100),    // ✅ random progress 0–100%
  rating: 4.5 + Math.random() * 0.5,            // 4.5 – 5.0
  enrollments: 500 + Math.floor(Math.random() * 5000),
  isNew: i % 5 === 0,                           // every 5th course marked new
  popular: i % 3 === 0,                         // every 3rd course popular
  recommended: i % 4 === 0,                     // every 4th course recommended
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
  ).toISOString(),                               // random within last year
  duration: `${4 + Math.floor(Math.random() * 10)}h`, // 4–14h
}))
