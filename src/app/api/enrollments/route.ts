import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

//
// 📘 /api/enrollments
// - GET:  list enrollments (student → own, admin/lecturer → all)
// - POST: create new enrollment after payment
//

// ✅ GET → fetch enrollments (scoped by role)
export async function GET(req: NextRequest) {
  try {
    // 🔑 Decode user token (universal for all roles)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, roles: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]

    const includeOptions = {
      user: { select: { id: true, name: true, email: true } },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          category: true,
        },
      },
    }

    // 🧠 Role-based scope
    const enrollments =
      roles.includes("admin") || roles.includes("lecturer")
        ? await prisma.enrollment.findMany({
            include: includeOptions,
            orderBy: { enrolledAt: "desc" },
          })
        : await prisma.enrollment.findMany({
            where: { userId: user.id },
            include: includeOptions,
            orderBy: { enrolledAt: "desc" },
          })

    return NextResponse.json(enrollments, { status: 200 })
  } catch (err) {
    console.error("GET /enrollments error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ✅ POST → create new enrollment (after payment success)
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.email)
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

    // 🧩 Verify course existence
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // 🛑 Prevent duplicate enrollments
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    })
    if (existing)
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )

    // 💰 Create enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        paymentStatus: "PAID",
        paymentRef: paymentRef || null,
        paymentMethod: paymentMethod || "Manual",
        amountPaid: amountPaid || 0,
        enrolledAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
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

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    console.error("POST /enrollments error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
