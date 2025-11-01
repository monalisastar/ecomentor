// src/types/course.ts

// 🧩 Base type for individual lessons
export type Lesson = {
  id: string
  title: string
  slug: string // 👈 required for routing and database consistency
  duration?: string
  description?: string
  videoUrl?: string
  documentUrl?: string
  resourceUrl?: string
  fileType?: 'video' | 'pdf' | 'resource'
  content?: string // 👈 required for Markdown, editor, and Prisma model
  order?: number
  moduleId?: string
  createdAt?: string
  updatedAt?: string
}

// 🧠 Module type — a group of lessons
export type Module = {
  id: string
  title: string
  slug: string // 👈 matches Prisma schema
  description?: string
  order?: number
  lessons: Lesson[]
  courseId?: string
  createdAt?: string
  updatedAt?: string
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
  createdAt?: string
  updatedAt?: string
}
