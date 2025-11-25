import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { nanoid } from "nanoid"

//
// ✅ POST /api/modules
// Create a new module under a course (lecturer/admin only)
//
export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 🧠 Fetch user roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const roles = user.roles || ["student"]
    if (!roles.includes("staff") && !roles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 📦 Extract request body
    const { courseId, title, order } = await req.json()
    if (!courseId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: courseId or title" },
        { status: 400 }
      )
    }

    // 🧩 Verify parent course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // 🧩 Auto-assign order if not specified
    const moduleCount = await prisma.module.count({ where: { courseId } })
    const newOrder = order ?? moduleCount + 1

    // 🏗️ Create module with unique slug
    const newModule = await prisma.module.create({
      data: {
        title,
        slug: nanoid(10),
        order: newOrder,
        courseId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        order: true,
        courseId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ module: newModule }, { status: 201 })
  } catch (error) {
    console.error("POST /modules error:", error)
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    )
  }
}

//
// ✅ GET /api/modules?courseId=xyz OR ?courseSlug=my-course
// Fetch all modules for a given course (with lessons)
//
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const courseSlug = searchParams.get("courseSlug")

    // 🧩 Resolve course ID if slug provided
    let resolvedCourseId = courseId
    if (!resolvedCourseId && courseSlug) {
      const course = await prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true },
      })
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      resolvedCourseId = course.id
    }

    if (!resolvedCourseId) {
      return NextResponse.json(
        { error: "Missing courseId or courseSlug" },
        { status: 400 }
      )
    }

    // 📚 Fetch modules (with lessons)
    const modules = await prisma.module.findMany({
      where: { courseId: resolvedCourseId },
      include: {
        lessons: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    })

    // ✅ Return consistent structure
    return NextResponse.json({ modules }, { status: 200 })
  } catch (error) {
    console.error("GET /modules error:", error)
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}
