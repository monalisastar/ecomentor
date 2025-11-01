import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { courseData } from "@/data/courseData"

/**
 * ✅ CourseWithModules Type
 * - Matches Prisma structure but allows `null` for nullable DB fields
 * - Supports fallback courseData which may not include all Prisma fields
 */
type CourseWithModules = {
  id: string
  title: string
  description?: string | null
  image?: string | null
  unlockWithAERA?: number | null
  slug: string
  modules?: any[]
  createdAt: Date
  updatedAt: Date
}

/**
 * ✅ GET /api/public/courses/[slug]
 * Fetch a course by its slug — from the DB if found, or from static courseData otherwise.
 */
export async function GET(context: { params?: { slug?: string | string[] } }) {
  try {
    // 🧩 Normalize slug param
    const slugParam = context.params?.slug
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 })
    }

    // 🧠 Fetch from DB by slug
    let course = (await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
      },
    })) as CourseWithModules | null

    // ⚙️ Fallback to static local courseData if DB doesn’t have it
    if (!course) {
      const fallback = courseData.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
      )
      if (!fallback) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }

      course = {
        id: fallback.slug,
        title: fallback.title,
        description: fallback.description ?? null,
        image: fallback.image ?? null,
        unlockWithAERA: fallback.unlockWithAERA ?? null,
        slug: fallback.slug,
        modules: (fallback as any).modules || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    // ✅ Success
    return NextResponse.json(course, { status: 200 })
  } catch (error: any) {
    console.error("❌ Error fetching course by slug:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
