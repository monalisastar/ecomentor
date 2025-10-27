// src/types/course.ts

// 🧩 Base type for individual lessons
export type Lesson = {
  id: string
  title: string
  duration: string
  description?: string
  videoUrl?: string
  documentUrl?: string
  resourceUrl?: string
  fileType?: 'video' | 'pdf' | 'resource'
  moduleId?: string
}

// 🧠 Module type — a group of lessons
export type Module = {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  courseId?: string
}

// 🎓 Course type — the top-level structure
export type Course = {
  id: string
  slug: string
  title: string
  description?: string
  modules: Module[]
  duration?: string
  thumbnailUrl?: string
  category?: string
  level?: string
}
