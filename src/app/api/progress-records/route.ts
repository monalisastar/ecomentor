import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * 📘 GET /api/progress-records
 * ---------------------------------------------------------
 * Modes:
 * 1️⃣ ?lessonId=id                → single lesson record
 * 2️⃣ ?courseSlug=slug            → all lesson progress for that course
 * 3️⃣ ?courseSlug=slug&summary=1  → course-level summary (progress %)
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const courseSlug = searchParams.get("courseSlug")
    const lessonId = searchParams.get("lessonId")
    const summary = searchParams.get("summary") === "1" || searchParams.get("summary") === "true"

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🎯 1️⃣ Single-lesson mode
    if (lessonId) {
      const record = await prisma.progressRecord.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        select: {
          id: true,
          lessonId: true,
          courseId: true,
          completedAt: true,
          score: true,
          isPassed: true,
        },
      })
      if (!record)
        return NextResponse.json({ message: "No progress found" }, { status: 404 })
      return NextResponse.json(record)
    }

    // 🎯 2️⃣ Course-based modes
    if (courseSlug) {
      const course = await prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true, slug: true, title: true },
      })
      if (!course)
        return NextResponse.json({ error: "Course not found" }, { status: 404 })

      // Get all progress for this student/course
      const records = await prisma.progressRecord.findMany({
        where: { userId: user.id, courseId: course.id },
        select: { lessonId: true, isPassed: true },
      })

      // ⚡ Summary request: return completion %
      if (summary) {
        const totalLessons = await prisma.lesson.count({
          where: { module: { courseId: course.id } },
        })
        const passed = records.filter((r) => r.isPassed).length
        const progress = totalLessons ? Math.round((passed / totalLessons) * 100) : 0

        return NextResponse.json({
          courseSlug: course.slug,
          courseTitle: course.title,
          progress,
          completed: progress === 100,
        })
      }

      // Default: detailed records
      return NextResponse.json(records)
    }

    return NextResponse.json(
      { error: "Missing courseSlug or lessonId parameter" },
      { status: 400 }
    )
  } catch (err) {
    console.error("❌ GET /progress-records error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * 📘 POST /api/progress-records
 * ---------------------------------------------------------
 * Creates or updates a user's progress record when they pass a quiz.
 * Expected body:
 * {
 *   lessonId: string,
 *   courseSlug: string,
 *   score?: number,
 *   isPassed: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { lessonId, courseSlug, score = null, isPassed = false } = body

    if (!lessonId || !courseSlug)
      return NextResponse.json(
        { error: "Missing required fields (lessonId or courseSlug)" },
        { status: 400 }
      )

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // ✅ Create or update record
    const record = await prisma.progressRecord.upsert({
      where: {
        userId_lessonId: { userId: user.id, lessonId },
      },
      update: {
        isPassed,
        score,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        courseId: course.id,
        score,
        isPassed,
        completedAt: new Date(),
      },
    })

    console.log("✅ Progress saved:", record)
    return NextResponse.json(record, { status: 200 })
  } catch (err) {
    console.error("❌ POST /progress-records error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
