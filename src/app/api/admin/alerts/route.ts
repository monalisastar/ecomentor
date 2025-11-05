import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/alerts
 * Fetch system-level alerts for the admin dashboard
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

    // 🧠 Count pending actions
    const [
      pendingCertificates,
      pendingPayments,
      underReviewCourses,
      pendingStaff,
    ] = await Promise.all([
      prisma.certificate.count({
        where: { status: "PENDING" },
      }),
      prisma.payment.count({
        where: { status: "PENDING" },
      }),
      prisma.course.count({
        where: { adminStatus: "UNDER_REVIEW" },
      }),
      prisma.user.count({
        where: {
          roles: { has: "staff" },
          password: null, // not yet activated
        },
      }),
    ])

    const alerts = []

    if (pendingCertificates > 0)
      alerts.push({
        type: "certificate",
        message: `${pendingCertificates} certificate(s) awaiting verification`,
        severity: "medium",
      })

    if (pendingPayments > 0)
      alerts.push({
        type: "payment",
        message: `${pendingPayments} payment(s) still pending`,
        severity: "high",
      })

    if (underReviewCourses > 0)
      alerts.push({
        type: "course",
        message: `${underReviewCourses} course(s) under review`,
        severity: "low",
      })

    if (pendingStaff > 0)
      alerts.push({
        type: "staff",
        message: `${pendingStaff} staff account(s) awaiting activation`,
        severity: "medium",
      })

    return NextResponse.json({ alerts })
  } catch (error: any) {
    console.error("❌ Admin alerts failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
