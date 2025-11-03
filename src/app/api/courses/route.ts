import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import slugify from "slugify"

/**
 * 📚 GET /api/courses
 * ---------------------------------------------------------
 * Handles retrieval of all courses (filtered + single)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const byId = searchParams.get("byId")
    const slug = searchParams.get("slug")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const scope = searchParams.get("scope")
    const publishedParam = searchParams.get("published")

    // 🧠 Identify user (optional)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userRoles =
      token?.email
        ? (
            await prisma.user.findUnique({
              where: { email: token.email },
              select: { roles: true },
            })
          )?.roles || []
        : []

    const isStaff = ["lecturer", "admin"].some((r) => userRoles.includes(r))

    // 🧭 1️⃣ Fetch by ID or Slug
    if (byId || slug) {
      const where = byId ? { id: byId } : { slug: slug! }

      const course = await prisma.course.findUnique({
        where,
        include: {
          modules: {
            include: { lessons: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
          enrollments: true,
          payments: true,
        },
      })

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }

      if (!isStaff && !course.published) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    // 📋 2️⃣ Build filters dynamically
    const filters: any = {}

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) filters.category = { equals: category }
    if (scope) filters.scope = { equals: scope }

    if (publishedParam === "true" || publishedParam === "false") {
      filters.published = publishedParam === "true"
    }

    // 🚀 3️⃣ Retrieve course list
    const courses = await prisma.course.findMany({
      where: {
        ...filters,
        ...(isStaff ? {} : { published: true }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        category: true,
        scope: true,
        priceUSD: true,
        published: true,
        instructorId: true,
        createdAt: true,
        updatedAt: true,
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
 * Create a new course (Lecturer/Admin only)
 * 🔤 Automatically normalizes title → slug (fixes typos, double spaces, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { email: true, roles: true, id: true },
    })

    if (!user || !["lecturer", "admin"].some((r) => user.roles.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, image, category, scope, priceUSD, published } = body

    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 })

    // ✅ Normalize title before slug creation
    const cleanedTitle = title
      .replace(/\s+/g, " ") // collapse multiple spaces
      .replace(/ssesntials/gi, "ssentials") // fix common typo like "essesntials"
      .trim()

    const baseSlug = slugify(cleanedTitle, { lower: true, strict: true })
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

    const newCourse = await prisma.course.create({
      data: {
        title: cleanedTitle,
        slug: uniqueSlug,
        description: description || "",
        image: image || "",
        category: category || "GHG_ACCOUNTING",
        scope: scope || null,
        priceUSD: priceUSD ?? 0,
        instructorId: user.id,
        published: published ?? false,
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

/**
 * ✏️ PATCH /api/courses
 * ---------------------------------------------------------
 * Update an existing course (Lecturer/Admin only)
 * Requires ?id= parameter
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id)
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { email: true, roles: true },
    })

    if (!user || !["lecturer", "admin"].some((r) => user.roles.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await req.json()

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        scope: data.scope,
        priceUSD: data.priceUSD,
        image: data.image,
        published: data.published,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedCourse, { status: 200 })
  } catch (error) {
    console.error("❌ Error updating course:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

/**
 * 🗑 DELETE /api/courses
 * ---------------------------------------------------------
 * Deletes a course (Lecturer/Admin only)
 * Requires ?id= parameter
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id)
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { email: true, roles: true },
    })

    if (!user || !["lecturer", "admin"].some((r) => user.roles.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.course.delete({ where: { id } })

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("❌ Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}
