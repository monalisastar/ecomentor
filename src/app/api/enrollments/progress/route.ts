import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ✅ GET /api/enrollments/progress?lessonId=xxxx
 * -------------------------------------------------
 * Returns the courseSlug, courseTitle, and current progress %
 * for the authenticated student — used for auto-certificate issuance.
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.sub)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧩 Extract lessonId from query string
    const lessonId = req.nextUrl.searchParams.get("lessonId")
    if (!lessonId)
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 })

    // 🧠 Find course via lesson > module > course relation
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, slug: true, title: true },
            },
          },
        },
      },
    })

    if (!lesson?.module?.course)
      return NextResponse.json(
        { error: "Lesson or course not found" },
        { status: 404 }
      )

    const course = lesson.module.course

    // 📊 Find student's enrollment for this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: token.sub,
        courseId: course.id,
      },
      select: { progress: true, completed: true },
    })

    // 🚀 Respond with core course info + progress %
    return NextResponse.json({
      courseSlug: course.slug,
      courseTitle: course.title,
      progress: enrollment?.progress ?? 0,
      completed: enrollment?.completed ?? false,
    })
  } catch (err: any) {
    console.error("❌ Error fetching enrollment progress:", err)
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    )
  }
}
