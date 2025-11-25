import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.warn("⚠️ No valid session found at /api/progress/overview")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, roles: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]

    //
    // 🧠 ADMIN DASHBOARD (global stats)
    //
    if (roles.includes("admin")) {
      const [totalUsers, totalEnrollments, completedEnrollments, avgProgress] =
        await Promise.all([
          prisma.user.count({ where: { roles: { has: "student" } } }),
          prisma.enrollment.count(),
          prisma.enrollment.count({ where: { completed: true } }),
          prisma.enrollment.aggregate({ _avg: { progress: true } }),
        ])

      return NextResponse.json(
        {
          role: "admin",
          summary: {
            totalUsers,
            totalEnrollments,
            completedEnrollments,
            averageProgress: Math.round(avgProgress._avg.progress || 0),
          },
        },
        { status: 200 }
      )
    }

    //
    // 👨‍🏫 STAFF DASHBOARD (only their courses)
    //
    if (roles.includes("staff") || roles.includes("lecturer")) {
      // 🧩 Gather course slugs taught by this instructor
      const courses = await prisma.course.findMany({
        where: { instructorId: user.id },
        select: { id: true, slug: true },
      })
      const courseIds = courses.map((c) => c.id)
      const courseSlugs = courses.map((c) => c.slug)

      // if no courses yet, return zeros safely
      if (courseIds.length === 0) {
        return NextResponse.json(
          {
            role: "staff",
            summary: {
              totalUsers: 0,
              totalEnrollments: 0,
              completedEnrollments: 0,
              averageProgress: 0,
            },
          },
          { status: 200 }
        )
      }

      // 🧮 Compute aggregates for instructor's courses
      const [uniqueStudents, totalEnrollments, completedEnrollments, avgProgress, totalCertificates] =
        await Promise.all([
          prisma.enrollment.groupBy({
            by: ["userId"],
            where: { courseId: { in: courseIds } },
            _count: true,
          }),
          prisma.enrollment.count({
            where: { courseId: { in: courseIds } },
          }),
          prisma.enrollment.count({
            where: { courseId: { in: courseIds }, completed: true },
          }),
          prisma.enrollment.aggregate({
            where: { courseId: { in: courseIds } },
            _avg: { progress: true },
          }),
          prisma.certificate.count({
            where: { courseSlug: { in: courseSlugs } },
          }),
        ])

      return NextResponse.json(
        {
          role: "staff",
          summary: {
            totalUsers: uniqueStudents.length, // distinct learners
            totalEnrollments,
            completedEnrollments: totalCertificates, // certificates issued for their courses
            averageProgress: Math.round(avgProgress._avg.progress || 0),
          },
        },
        { status: 200 }
      )
    }

    //
    // 🎓 STUDENT DASHBOARD (personal stats)
    //
    const [enrolledCount, completedCount, certificateCount, avgProgress] =
      await Promise.all([
        prisma.enrollment.count({ where: { userId: user.id } }),
        prisma.enrollment.count({
          where: { userId: user.id, completed: true },
        }),
        prisma.certificate.count({ where: { studentId: user.id } }),
        prisma.enrollment.aggregate({
          where: { userId: user.id },
          _avg: { progress: true },
        }),
      ])

    const recentCourses = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: { select: { title: true, slug: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    })

    return NextResponse.json(
      {
        role: "student",
        summary: {
          enrolled: enrolledCount,
          completed: completedCount,
          certificates: certificateCount,
          averageProgress: Math.round(avgProgress._avg.progress || 0),
        },
        recentCourses,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ GET /progress/overview error:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress overview" },
      { status: 500 }
    )
  }
}
