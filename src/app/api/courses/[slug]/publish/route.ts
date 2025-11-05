import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * ✅ PATCH /api/staff/courses/[courseSlug]/publish
 * ---------------------------------------------------------
 * Publishes a course after verifying:
 * - User has staff/admin privileges
 * - Course exists and is not already published
 * - Course contains at least one module and lesson
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  try {
    const { courseSlug } = params

    // 🧠 1. Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isStaff = user?.roles?.some((r) => ["lecturer", "admin"].includes(r))
    if (!isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 🧩 2. Find the course
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        modules: { include: { lessons: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.published) {
      return NextResponse.json({ message: "Course already published" }, { status: 200 })
    }

    // ⚙️ 3. Validation: ensure course has content before publishing
    const hasModules = course.modules.length > 0
    const hasLessons = course.modules.some((m) => m.lessons.length > 0)

    if (!hasModules || !hasLessons) {
      return NextResponse.json(
        { error: "Cannot publish course without modules and lessons" },
        { status: 400 }
      )
    }

    // 🚀 4. Update course status
    const publishedCourse = await prisma.course.update({
      where: { slug: courseSlug },
      data: {
        published: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
      },
    })

    // 🎉 5. Return success
    return NextResponse.json({
      message: "Course published successfully",
      course: publishedCourse,
    })
  } catch (error) {
    console.error("Error publishing course:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
