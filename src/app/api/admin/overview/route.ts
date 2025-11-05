import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * GET /api/admin/overview
 * Returns global system stats for admin dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Verify user role
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 📊 Collect stats
    const [totalUsers, totalCourses, totalEnrollments, totalCertificates, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.certificate.count(),
        prisma.payment.aggregate({ _sum: { amount: true } }),
      ])

    const summary = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      totalRevenue: totalRevenue._sum.amount || 0,
    }

    // 🧾 Recent activity — last 5 enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      take: 5,
      include: { user: true, course: true },
    })

    const activity = recentEnrollments.map((e) => ({
      message: `${e.user?.name || "A student"} enrolled in ${
        e.course?.title || "a course"
      }`,
      time: new Date(e.enrolledAt).toLocaleString(),
    }))

    return NextResponse.json({ summary, activity })
  } catch (error: any) {
    console.error("❌ Admin overview error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
