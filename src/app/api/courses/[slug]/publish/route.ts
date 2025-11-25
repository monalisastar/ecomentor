import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * ✅ PATCH /api/courses/[slug]/publish
 * Publishes a course after verifying:
 * - User has staff/lecturer/admin privileges
 * - Course exists and is not already published
 * - Course contains at least one module and lesson
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params // ✅ Await params here

  try {
    // 🧠 1️⃣ Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    // ✅ Allow staff, lecturer, and admin
    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user?.roles?.some((r) => allowedRoles.includes(r))
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧩 2️⃣ Find the course
    const course = await prisma.course.findUnique({
      where: { slug },
      include: { modules: { include: { lessons: true } } },
    })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    if (course.published)
      return NextResponse.json(
        { message: "Course already published" },
        { status: 200 }
      )

    // ⚙️ 3️⃣ Validation: ensure course has at least one module & lesson
    const hasModules = course.modules.length > 0
    const hasLessons = course.modules.some((m) => m.lessons.length > 0)
    if (!hasModules || !hasLessons)
      return NextResponse.json(
        { error: "Cannot publish course without modules and lessons" },
        { status: 400 }
      )

    // 🚀 4️⃣ Publish the course
    const publishedCourse = await prisma.course.update({
      where: { slug },
      data: { published: true, updatedAt: new Date() },
      select: { id: true, title: true, slug: true, published: true },
    })

    // 🎉 5️⃣ Success response
    return NextResponse.json({
      message: "Course published successfully",
      course: publishedCourse,
    })
  } catch (error) {
    console.error("❌ Error publishing course:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
