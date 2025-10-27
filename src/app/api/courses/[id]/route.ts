import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// ✅ GET /api/courses/[id] → Fetch one course (with modules & lessons)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
        enrollments: true,
        payments: true,
      },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    return NextResponse.json(course, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

// ✅ PATCH /api/courses/[id] → Update course details (Lecturer/Admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🔎 Fetch user and roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🔒 Restrict to lecturers or admins
    if (!["lecturer", "admin"].some((r) => user.roles.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()

    // 🧩 Only update provided fields
    const data: any = {}
    if (body.title) data.title = body.title
    if (body.description) data.description = body.description
    if (body.image) data.image = body.image
    if (body.category) data.category = body.category
    if (body.unlockWithAERA !== undefined) data.unlockWithAERA = body.unlockWithAERA

    // Auto-generate slug if title changed
    if (body.title) {
      data.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    }

    data.updatedAt = new Date()

    const updated = await prisma.course.update({
      where: { id },
      data,
    })

    console.log(`✅ Course updated: ${updated.title}`)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("❌ Error updating course:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

// ✅ DELETE /api/courses/[id] → Delete course (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🔎 Verify user is admin
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (!user.roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params

    // 🧹 Cascade delete (modules, lessons, enrollments, payments)
    await prisma.lesson.deleteMany({ where: { module: { courseId: id } } })
    await prisma.module.deleteMany({ where: { courseId: id } })
    await prisma.enrollment.deleteMany({ where: { courseId: id } })
    await prisma.payment.deleteMany({ where: { courseId: id } })
    await prisma.course.delete({ where: { id } })

    console.log(`🗑️ Course deleted: ${id}`)
    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("❌ Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}
