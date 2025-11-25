import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import slugify from "slugify"

/**
 * 📘 GET /api/courses/[slug]
 * ---------------------------------------------------------
 * Fetch a single course by slug
 * Staff, lecturer, or admin can view unpublished courses.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    const user = token?.email
      ? await prisma.user.findUnique({
          where: { email: token.email },
          select: { roles: true },
        })
      : null

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isStaff = user?.roles?.some((r) => allowedRoles.includes(r)) ?? false

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, email: true, name: true } },
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    if (!course.published && !isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json(course, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

/**
 * ✏️ PATCH /api/courses/[slug]
 * ---------------------------------------------------------
 * Update an existing course by slug
 * Allowed: Only instructor or admin
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // ✅ Get current user
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true },
    })

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user?.roles?.some((r) => allowedRoles.includes(r))
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // ✅ Get existing course
    const existing = await prisma.course.findUnique({
      where: { slug },
      select: { id: true, title: true, instructorId: true },
    })

    if (!existing)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // 🚫 Restrict edits to instructor or admin
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin && existing.instructorId !== user?.id)
      return NextResponse.json(
        { error: "You are not allowed to edit this course." },
        { status: 403 }
      )

    // ✅ Handle updates
    const body = await req.json()
    const data: any = {}

    if (body.title) data.title = body.title
    if (body.description) data.description = body.description
    if (body.image) data.image = body.image
    if (body.category) data.category = body.category
    if (body.scope) data.scope = body.scope
    if (body.priceUSD !== undefined) data.priceUSD = parseFloat(body.priceUSD)
    if (body.published !== undefined) data.published = body.published

    if (body.title && body.title !== existing.title) {
      data.slug = `${slugify(body.title, { lower: true, strict: true })}-${Date.now().toString(36)}`
    }

    data.updatedAt = new Date()

    const updated = await prisma.course.update({
      where: { id: existing.id },
      data,
    })

    console.log(`✅ Course updated: ${updated.title}`)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("❌ Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

/**
 * 🗑 DELETE /api/courses/[slug]
 * ---------------------------------------------------------
 * Deletes a course and related data
 * Allowed: Only instructor or admin
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // ✅ Get current user
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true },
    })

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user?.roles?.some((r) => allowedRoles.includes(r))
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // ✅ Find course with instructorId
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true, instructorId: true },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // 🚫 Restrict deletion (only instructor or admin)
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin && course.instructorId !== user?.id)
      return NextResponse.json(
        { error: "You are not allowed to delete this course." },
        { status: 403 }
      )

    const courseId = course.id

    // 🧹 Delete dependent records safely
    await prisma.$transaction([
      prisma.lesson.deleteMany({ where: { module: { courseId } } }),
      prisma.module.deleteMany({ where: { courseId } }),
      prisma.enrollment.deleteMany({ where: { courseId } }),
      prisma.payment.deleteMany({ where: { courseId } }),
      prisma.course.delete({ where: { id: courseId } }),
    ])

    console.log(`🗑️ Course deleted successfully: ${slug}`)
    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course", details: error.message },
      { status: 500 }
    )
  }
}
