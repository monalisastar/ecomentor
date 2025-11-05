import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/activity
 * Returns the latest platform activity for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧾 Gather recent events: enrollments, certificates, courses
    const [enrollments, certificates, courses] = await Promise.all([
      prisma.enrollment.findMany({
        orderBy: { enrolledAt: "desc" },
        take: 5,
        include: { user: true, course: true },
      }),
      prisma.certificate.findMany({
        orderBy: { issueDate: "desc" },
        take: 5,
      }),
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    // 🧠 Normalize activity feed
    const activity = [
      ...enrollments.map((e) => ({
        type: "enrollment",
        message: `${e.user?.name || "A student"} enrolled in ${
          e.course?.title || "a course"
        }`,
        time: new Date(e.enrolledAt).toLocaleString(),
      })),
      ...certificates.map((c) => ({
        type: "certificate",
        message: `Certificate issued for ${c.courseTitle}`,
        time: new Date(c.issueDate).toLocaleString(),
      })),
      ...courses.map((c) => ({
        type: "course",
        message: `New course created: ${c.title}`,
        time: new Date(c.createdAt).toLocaleString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)

    return NextResponse.json({ activity })
  } catch (error: any) {
    console.error("❌ Failed to fetch admin activity:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
