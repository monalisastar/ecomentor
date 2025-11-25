import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ⚡ GET /api/courses/completed?uncertified=true
 * ---------------------------------------------------------
 * Lists all completed (100%) enrollments within the last 24 hours.
 * When `uncertified=true`, filters out those who already have certificates.
 * Accessible to staff, lecturer, or admin roles.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uncertified = searchParams.get("uncertified") === "true"

    // 🔒 Authenticate
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

    // 🕒 Only consider completions within the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // 🧩 Fetch all completed enrollments (100% progress)
    const completed = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        updatedAt: { gte: since },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { slug: true, title: true } },
      },
    })

    // 🚀 If not filtering uncertified, return all completions
    if (!uncertified) return NextResponse.json(completed, { status: 200 })

    // 🧾 Fetch all existing certificates (for the same student + courseSlug)
    const existingCerts = await prisma.certificate.findMany({
      where: {
        OR: completed.map((e) => ({
          studentId: e.user.id,
          courseSlug: e.course.slug,
        })),
      },
      select: { studentId: true, courseSlug: true },
    })

    // 🧮 Build lookup Set for quick filtering
    const certifiedSet = new Set(
      existingCerts.map((c) => `${c.studentId}:${c.courseSlug}`)
    )

    // 🔎 Filter only completions without certificates
    const results = completed
      .filter((e) => !certifiedSet.has(`${e.user.id}:${e.course.slug}`))
      .map((e) => ({
        studentId: e.user.id,
        studentName: e.user.name ?? "Unnamed Student",
        studentEmail: e.user.email ?? "Unknown Email",
        courseSlug: e.course.slug,
        courseTitle: e.course.title ?? "Untitled Course",
        completedAt: e.updatedAt,
      }))

    return NextResponse.json(results, { status: 200 })
  } catch (err: any) {
    console.error("❌ Error fetching completed uncertified courses:", err)
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    )
  }
}
