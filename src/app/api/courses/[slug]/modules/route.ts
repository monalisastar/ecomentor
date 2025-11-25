import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import slugify from "slugify"
import { getToken } from "next-auth/jwt"

/**
 * 📘 POST /api/courses/[slug]/modules
 * ---------------------------------------------------------
 * Create a new module under a specific course.
 * Allowed roles: staff, lecturer, admin
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const { title, description, objectives } = body

    // 🧠 1️⃣ Authenticate & authorize user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user?.roles?.some((r) => allowedRoles.includes(r))

    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧩 2️⃣ Validate input
    if (!title)
      return NextResponse.json(
        { error: "Module title is required." },
        { status: 400 }
      )

    // 🔍 3️⃣ Find the parent course
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found." }, { status: 404 })

    // 🧮 4️⃣ Generate a unique slug for the module
    const baseSlug = slugify(title, { lower: true, strict: true })
    const moduleSlug = `${baseSlug}-${Date.now().toString(36)}`

    // 🏗️ 5️⃣ Create the new module
    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        objectives,
        slug: moduleSlug,
        courseId: course.id,
      },
    })

    return NextResponse.json(newModule, { status: 201 })
  } catch (error: any) {
    console.error("❌ Error creating module:", error)
    return NextResponse.json(
      { error: "Failed to create module.", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * 📗 GET /api/courses/[slug]/modules
 * ---------------------------------------------------------
 * Get all modules belonging to a specific course.
 * Accessible to all users (public view of published courses).
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // 🔍 Find the course first
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found." }, { status: 404 })

    // 📦 Fetch all modules for that course
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "asc" },
      include: {
        lessons: true,
      },
    })

    return NextResponse.json(modules, { status: 200 })
  } catch (error: any) {
    console.error("❌ Error fetching modules:", error)
    return NextResponse.json(
      { error: "Failed to fetch modules.", details: error.message },
      { status: 500 }
    )
  }
}
