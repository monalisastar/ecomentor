import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ✅ GET  /api/admin/courses/review
 * Fetch all courses currently under review or revoked.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🔒 Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧩 Fetch courses needing review
    const courses = await prisma.course.findMany({
      where: { adminStatus: { in: ["UNDER_REVIEW", "REVOKED"] } },
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({ courses })
  } catch (error: any) {
    console.error("❌ Error loading review courses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * ✅ PATCH /api/admin/courses/review
 * Update a course's adminStatus (APPROVED or REVOKED).
 */
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🔒 Verify admin role before updating
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 📦 Parse and validate input
    const { courseId, action } = await req.json()
    if (!courseId || !["APPROVED", "REVOKED"].includes(action))
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    // 🧱 Update course admin status
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { adminStatus: action },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error: any) {
    console.error("❌ Error updating course status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
