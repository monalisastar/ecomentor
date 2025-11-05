import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ✅ GET /api/student/profile
 * ---------------------------------------------------------
 * Returns a full student profile with:
 * - Basic info
 * - Dynamic progress per course (batched, optimized)
 * - Certificates
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Authenticate
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Get user, enrollments, courses (modules + lessons)
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                tier: true,
                priceUSD: true,
                image: true,
                published: true,
                modules: {
                  select: {
                    id: true,
                    lessons: { select: { id: true } },
                  },
                },
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
        certificates: { orderBy: { issueDate: "desc" } },
      },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🗂️ Collect all course IDs
    const courseIds = user.enrollments.map((enr) => enr.course.id)

    // 📊 Fetch all progress records in one go
    const progressRecords = await prisma.progressRecord.findMany({
      where: { userId: user.id, courseId: { in: courseIds } },
      select: { courseId: true },
    })

    // 🧮 Group completed lessons per course
    const completedByCourse: Record<string, number> = {}
    for (const rec of progressRecords) {
      completedByCourse[rec.courseId] =
        (completedByCourse[rec.courseId] || 0) + 1
    }

    // 🧮 Compute dynamic progress for each enrollment
    const enrolledCourses = user.enrollments.map((enr) => {
      const course = enr.course

      // Total lessons across modules
      const totalLessons =
        course.modules?.reduce(
          (acc, mod) => acc + (mod.lessons?.length || 0),
          0
        ) || 0

      // Completed lessons for this course
      const completedLessons = completedByCourse[course.id] || 0

      const computedProgress =
        totalLessons > 0
          ? Math.min(Math.round((completedLessons / totalLessons) * 100), 100)
          : enr.progress ?? 0

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        category: course.category,
        tier: course.tier,
        priceUSD: course.priceUSD,
        image: course.image,
        published: course.published,
        progress: computedProgress,
        completed: computedProgress === 100,
        enrolledAt: enr.enrolledAt,
        paymentStatus: enr.paymentStatus,
        paymentMethod: enr.paymentMethod,
        amountPaid: enr.amountPaid,
      }
    })

    // 🎓 Certificates section
    const certificates = user.certificates.map((cert) => ({
      id: cert.id,
      courseTitle: cert.courseTitle,
      courseSlug: cert.courseSlug,
      type: cert.type,
      status: cert.status,
      issueDate: cert.issueDate,
      certificateUrl: cert.certificateUrl,
      verificationUrl: cert.verificationUrl,
      issuedBy: cert.issuedBy,
      verifiedBy: cert.verifiedBy,
      score: cert.score,
      durationHours: cert.durationHours,
    }))

    // 🧾 Final response
    const profileData = {
      name: user.name || "Student",
      email: user.email,
      specialization: user.specialization,
      bio: user.bio,
      totalEnrollments: user.enrollments.length,
      totalCertificates: user.certificates.length,
      enrolledCourses,
      certificates,
    }

    return NextResponse.json(profileData, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching student profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
