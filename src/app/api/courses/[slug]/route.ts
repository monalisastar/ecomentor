import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } // 👈 fix
) {
  try {
    const { slug } = await context.params // 👈 must await
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    const user = token?.email
      ? await prisma.user.findUnique({
          where: { email: token.email },
          select: { roles: true },
        })
      : null

    const isStaff = user?.roles?.some((r) => ["lecturer", "admin"].includes(r)) ?? false

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    if (!course.published && !isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json(course, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } // 👈 fix
) {
  try {
    const { slug } = await context.params // 👈 must await
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    if (!user || !["lecturer", "admin"].some((r) => user.roles.includes(r)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const existing = await prisma.course.findUnique({ where: { slug } })
    if (!existing)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const body = await req.json()
    const data: any = {}

    if (body.title) data.title = body.title
    if (body.description) data.description = body.description
    if (body.image) data.image = body.image
    if (body.category) data.category = body.category
    if (body.scope) data.scope = body.scope
    if (body.priceUSD !== undefined) data.priceUSD = parseFloat(body.priceUSD)
    if (body.published !== undefined) data.published = body.published

    if (body.title && body.title !== existing.title) {
      const slugify = (await import("slugify")).default
      data.slug =
        slugify(body.title, { lower: true, strict: true }) +
        "-" +
        Date.now().toString(36)
    }

    data.updatedAt = new Date()

    const updated = await prisma.course.update({
      where: { id: existing.id },
      data,
    })

    console.log(`✅ Course updated: ${updated.title}`)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("❌ Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } // 👈 fix
) {
  try {
    const { slug } = await context.params // 👈 must await
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    if (!user || !user.roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const course = await prisma.course.findUnique({ where: { slug } })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const courseId = course.id

    await prisma.$transaction([
      prisma.lesson.deleteMany({ where: { module: { courseId } } }),
      prisma.module.deleteMany({ where: { courseId } }),
      prisma.enrollment.deleteMany({ where: { courseId } }),
      prisma.payment.deleteMany({ where: { courseId } }),
      prisma.course.delete({ where: { id: courseId } }),
    ])

    console.log(`🗑️ Course deleted successfully: ${slug}`)
    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("❌ Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course", details: error.message },
      { status: 500 }
    )
  }
}
