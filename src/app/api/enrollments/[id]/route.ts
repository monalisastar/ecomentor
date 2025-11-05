import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { CertificateStatus } from "@prisma/client"
import { randomUUID } from "crypto" // ✅ added import
import type { NextRequest } from "next/server"

// 📘 /api/enrollments/[id]
// Handles: GET (view), PUT (update progress/completion), DELETE (admin remove)

// ✅ GET — Fetch enrollment (by ID or course slug)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userEmail = token?.email
    const user = userEmail
      ? await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, roles: true } })
      : null

    const userId = user?.id
    const roles = user?.roles || ["guest"]
    const { id } = params

    // 🧠 Try by enrollment ID first
    let enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    // 🧠 If not found, try by course slug
    if (!enrollment) {
      const course = await prisma.course.findUnique({
        where: { slug: id },
        include: {
          modules: {
            include: { lessons: true },
            orderBy: { order: "asc" },
          },
        },
      })

      if (course && userId) {
        enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
          include: {
            course: {
              include: {
                modules: {
                  include: { lessons: true },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        })
      }

      // ✅ Allow course preview even if not enrolled
      if (!enrollment && course) {
        return NextResponse.json(
          { course, message: "Not enrolled yet" },
          { status: 200 }
        )
      }
    }

    if (!enrollment)
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })

    // 🧠 Role restriction
    if (
      !roles.includes("admin") &&
      !roles.includes("lecturer") &&
      enrollment.userId !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(enrollment, { status: 200 })
  } catch (err) {
    console.error("GET /enrollments/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PUT — Update progress / mark completion
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true, name: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = params
    const { progress, completed } = await req.json()

    const enrollment = await prisma.enrollment.findUnique({ where: { id } })
    if (!enrollment)
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })

    const roles = user.roles || ["student"]
    if (
      !roles.includes("admin") &&
      !roles.includes("lecturer") &&
      enrollment.userId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        progress: progress ?? enrollment.progress,
        completed: completed ?? enrollment.completed,
        updatedAt: new Date(),
      },
    })

    // 🧾 Auto-issue certificate if newly completed
    if (completed && !enrollment.completed) {
      const course = await prisma.course.findUnique({
        where: { id: enrollment.courseId },
      })

      if (course) {
        await prisma.certificate.create({
          data: {
            studentId: user.id,
            studentName: user.name || "Student",
            courseSlug: course.slug,
            courseTitle: course.title,
            verificationId: randomUUID(), // ✅ added
            verificationUrl: `/verify/${id}`,
            status: CertificateStatus.PENDING,
          },
        })
      }
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error("PUT /enrollments/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ DELETE — Admin removes enrollment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (!user.roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    const enrollment = await prisma.enrollment.findUnique({ where: { id } })
    if (!enrollment)
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })

    await prisma.enrollment.delete({ where: { id } })
    return NextResponse.json({ message: "Enrollment deleted successfully" }, { status: 200 })
  } catch (err) {
    console.error("DELETE /enrollments/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
