import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * 📚 GET /api/courses
 * ---------------------------------------------------------
 * - GET /api/courses → list all published courses
 * - GET /api/courses?byId=xyz → get course by ID
 * - GET /api/courses?slug=abc → get course by slug
 * - GET /api/courses?includeDrafts=true → staff-only, shows unpublished
 * - Optional ?search= and ?category= filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const byId = searchParams.get("byId")
    const slug = searchParams.get("slug")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const includeDrafts = searchParams.get("includeDrafts") === "true"

    // 🧠 Identify user role (if logged in)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userRoles = token?.email
      ? (
          await prisma.user.findUnique({
            where: { email: token.email },
            select: { roles: true },
          })
        )?.roles || []
      : []

    const isStaff = ["lecturer", "admin"].some((r) => userRoles.includes(r))

    // 🔒 Restrict draft access to staff only
    if (includeDrafts && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 🧭 Fetch by ID or slug
    if (byId || slug) {
      const where = byId ? { id: byId } : { slug: slug! }

      const course = await prisma.course.findUnique({
        where,
        include: {
          modules: {
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
          enrollments: true,
          payments: true,
        },
      })

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }

      const totalLessons = course.modules.reduce(
        (count, m) => count + m.lessons.length,
        0
      )

      return NextResponse.json(
        {
          ...course,
          meta: {
            totalLessons,
            totalEnrollments: course.enrollments.length,
            totalPayments: course.payments.length,
          },
        },
        { status: 200 }
      )
    }

    // 📋 Build filters for list view
    const filters: any = {}
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }
    if (category)
      filters.category = { equals: category, mode: "insensitive" }

    // 🚀 Retrieve course list
    const courses = await prisma.course.findMany({
      where: {
        ...filters,
        ...(includeDrafts
          ? {} // staff can see all
          : { published: true }), // only published for public users
      },
      include: {
        modules: true,
        enrollments: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

/**
 * ✍️ POST /api/courses
 * ---------------------------------------------------------
 * Creates new course (lecturer/admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { email: true, roles: true },
    })

    if (!user || !["lecturer", "admin"].some((r) => user.roles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { title, description, image, category, priceUSD, published } =
      await req.json()

    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const slugify = (await import("slugify")).default
    const baseSlug = slugify(title, { lower: true, strict: true })
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug: uniqueSlug,
        description: description || "",
        image: image || "",
        category: category || "General",
        priceUSD: priceUSD ?? 0,
        createdBy: user.email,
        published: published ?? false, // 🆕 track published state
      },
    })

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}
