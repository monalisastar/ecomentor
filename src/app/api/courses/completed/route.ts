import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ⚡ Optimized: GET /api/courses/completed?uncertified=true
 * ---------------------------------------------------------
 * Lists all completed (100%) enrollments within the last 24 hours.
 * When `uncertified=true`, filters out those who already have certificates.
 * Only accessible to staff/admin users.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uncertified = searchParams.get("uncertified") === "true"

    // 🔒 Authenticate staff/admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isStaff = user?.roles?.some((r) => ["lecturer", "admin"].includes(r))
    if (!isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🕒 Only consider completions within the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // 🧩 Fetch all completed enrollments once
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

    if (!uncertified)
      return NextResponse.json(completed, { status: 200 })

    // 🧠 Extract all unique (studentId + courseSlug) pairs
    const pairs = completed.map(
      (e) => `${e.user.id}:${e.course.slug}`
    )

    // 🧾 Fetch all existing certificates in a single query
    const existingCerts = await prisma.certificate.findMany({
      where: {
        OR: completed.map((e) => ({
          studentId: e.user.id,
          courseSlug: e.course.slug,
        })),
      },
      select: { studentId: true, courseSlug: true },
    })

    // 🚀 Build a Set for quick lookup
    const certifiedSet = new Set(
      existingCerts.map((c) => `${c.studentId}:${c.courseSlug}`)
    )

    // 🧮 Filter uncertified completions
    const results = completed
      .filter(
        (e) => !certifiedSet.has(`${e.user.id}:${e.course.slug}`)
      )
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
