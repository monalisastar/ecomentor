import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// ✅ GET /api/courses → Fetch all or filter by search/category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    // 🧩 Build dynamic filters
    const filters: any = {}

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      filters.category = { equals: category, mode: "insensitive" }
    }

    const courses = await prisma.course.findMany({
      where: Object.keys(filters).length > 0 ? filters : undefined,
      include: {
        modules: { include: { lessons: true } },
        enrollments: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses, { status: 200 })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

// ✅ POST /api/courses → Create new course (Lecturer/Admin only)
export async function POST(req: NextRequest) {
  try {
    // 🔑 Decode token (works for all protected routes)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Fetch user + roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { email: true, roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🔒 Only lecturers or admins can create courses
    if (!["lecturer", "admin"].some((r) => user.roles.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, image, category } = body

    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      )
    }

    // 🧠 Generate slug (unique + clean)
    const slugify = (await import("slugify")).default
    const slug =
      slugify(title, { lower: true, strict: true }) +
      "-" +
      Math.random().toString(36).substring(2, 7)

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug,
        description: description || "",
        image: image || "",
        category: category || "General",
        createdBy: user.email,
      },
    })

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}
