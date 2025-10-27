import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// ✅ POST /api/modules → Create a new module under a course (lecturer/admin only)
export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Fetch user roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]
    if (!roles.includes("lecturer") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { courseId, title, order } = await req.json()

    if (!courseId || !title)
      return NextResponse.json(
        { error: "Missing required fields: courseId or title" },
        { status: 400 }
      )

    // 🧩 Verify parent course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // 🧩 Auto-assign order if not specified
    const moduleCount = await prisma.module.count({ where: { courseId } })
    const newOrder = order ?? moduleCount + 1

    // 🏗️ Create module
    const newModule = await prisma.module.create({
      data: { title, order: newOrder, courseId },
    })

    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error("POST /modules error:", error)
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    )
  }
}

// ✅ GET /api/modules?courseId=xyz → Fetch all modules for a given course
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    if (!courseId)
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 })

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { title: "asc" },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(modules, { status: 200 })
  } catch (error) {
    console.error("GET /modules error:", error)
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}
