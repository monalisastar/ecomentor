import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

// ✅ Use Node.js runtime (Prisma cannot run on Edge)
export const runtime = "nodejs"

// 📘 /api/enrollments
// - GET: List enrollments (student → own, admin/lecturer → all)
// - POST: Create new enrollment after payment
// ------------------------------------------------------------

// ✅ GET → Fetch enrollments scoped by user role
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Lightweight user lookup
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]

    // 🔍 Optimized field selection to minimize payload
    const selectFields = {
      id: true,
      progress: true,
      completed: true,
      paymentStatus: true,
      enrolledAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          category: true,
          tier: true,
          scope: true,
        },
      },
    }

    // 🎯 Role-based filtering
    const whereClause =
      roles.includes("admin") || roles.includes("lecturer")
        ? {}
        : { userId: user.id }

    // 🚀 Use compound index (courseId, userId) for fast lookups
    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      select: selectFields,
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json(enrollments, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    console.error("GET /api/enrollments error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ POST → Create enrollment (after payment)
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { courseId, paymentRef, paymentMethod, amountPaid } = await req.json()
    if (!courseId)
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )

    // 🧠 Parallel check for course and duplicate enrollment
    const [course, existing] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, slug: true },
      }),
      prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
        select: { id: true },
      }),
    ])

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    if (existing)
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )

    // 💳 Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        paymentStatus: "PAID",
        paymentRef: paymentRef || null,
        paymentMethod: paymentMethod || "Manual",
        amountPaid: amountPaid || 0,
        enrolledAt: new Date(),
      },
      select: {
        id: true,
        courseId: true,
        enrolledAt: true,
        paymentStatus: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            category: true,
          },
        },
      },
    })

    // 🧩 Smart response: returns small payload for dashboards
    return NextResponse.json(enrollment, {
      status: 201,
      headers: {
        "Cache-Control": "no-store", // no cache for writes
      },
    })
  } catch (err) {
    console.error("POST /api/enrollments error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
