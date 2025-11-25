import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { CertificateStatus } from "@prisma/client"
import { randomUUID } from "crypto"

// ✅ Use Node.js runtime (Prisma cannot run on Edge)
export const runtime = "nodejs"

// 📘 GET — Fetch enrollment or fallback course by slug
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    const userEmail = token?.email
    const user =
      userEmail &&
      (await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, roles: true },
      }))

    const userId = user?.id
    const roles = user?.roles || ["guest"]

    // ✅ Selectively fetch only needed fields for speed
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        progress: true,
        completed: true,
        userId: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            image: true,
            instructor: { select: { id: true, name: true, image: true } },
            modules: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,
                lessons: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    description: true,
                    duration: true,
                    videoUrl: true,
                    fileUrl: true,
                    fileName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      // 🧩 Fallback: Fetch course by slug (if not yet enrolled)
      const course = await prisma.course.findUnique({
        where: { slug: id },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          image: true,
          instructor: { select: { id: true, name: true, image: true } },
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  order: true,
                  description: true,
                  duration: true,
                  videoUrl: true,
                  fileUrl: true,
                  fileName: true,
                },
              },
            },
          },
        },
      })

      if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

      // 🎓 If course found but not enrolled
      if (userId) {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
          select: { id: true, progress: true, completed: true },
        })
        if (existingEnrollment) {
          return NextResponse.json(
            { ...existingEnrollment, course },
            {
              status: 200,
              headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
            }
          )
        }
      }

      return NextResponse.json(
        { course, message: "Not enrolled yet" },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
        }
      )
    }

    // 🛡️ Role-based access
    if (!roles.includes("admin") && !roles.includes("lecturer") && enrollment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ✅ Cache short-term for students (revalidation every 2 min)
    return NextResponse.json(enrollment, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    })
  } catch (err) {
    console.error("GET /enrollments/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PUT — Update progress and auto-issue certificate
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true, name: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { progress, completed } = await req.json()
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      select: { id: true, userId: true, courseId: true, completed: true, progress: true },
    })

    if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    const roles = user.roles || ["student"]
    if (!roles.includes("admin") && !roles.includes("lecturer") && enrollment.userId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        progress: progress ?? enrollment.progress,
        completed: completed ?? enrollment.completed,
        updatedAt: new Date(),
      },
      select: { id: true, progress: true, completed: true, updatedAt: true },
    })

    // 🎓 Auto-create certificate if first-time completion
    if (completed && !enrollment.completed) {
      const course = await prisma.course.findUnique({
        where: { id: enrollment.courseId },
        select: { slug: true, title: true },
      })

      if (course) {
        await prisma.certificate.create({
          data: {
            studentId: user.id,
            studentName: user.name || "Student",
            courseSlug: course.slug,
            courseTitle: course.title,
            verificationId: randomUUID(),
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

// ✅ DELETE — Admin-only removal
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!user.roles.includes("admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const enrollment = await prisma.enrollment.findUnique({ where: { id } })
    if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })

    await prisma.enrollment.delete({ where: { id } })
    return NextResponse.json({ message: "Enrollment deleted successfully" }, { status: 200 })
  } catch (err) {
    console.error("DELETE /enrollments/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
