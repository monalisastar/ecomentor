import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, image: true },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                quizzes: true,
              },
            },
          },
        },
        reviews: {
          take: 3,
          include: {
            user: { select: { name: true } },
          },
        },
        announcements: {
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 2,
        },
      },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    return NextResponse.json(course)
  } catch (error) {
    console.error("❌ Error fetching course:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
