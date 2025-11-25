import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

/**
 * ✅ GET /api/progress/insights
 * ---------------------------------------------------------
 * Returns key learning statistics for the logged-in student:
 * - totalHours: estimated from completed lessons
 * - avgQuizScore: mean of all quiz attempts
 * - totalCertificates: verified certificates earned
 * - weeklyData: progress records for the past 7 days
 */
export async function GET() {
  try {
    // 🔐 Authenticate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.warn("⚠️ No valid session found at /api/progress/insights")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const email = session.user.email

    // 👤 Find current user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, roles: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]

    //
    // 🎓 Student Dashboard Insights
    //
    if (roles.includes("student")) {
      // 🕒 Approx total hours = lessons completed × 15 min avg
      const completedLessons = await prisma.progressRecord.count({
        where: { userId: user.id },
      })
      const totalHours = Math.round((completedLessons * 15) / 60)

      // 🧠 Average quiz score (type-safe)
      interface AttemptScore {
        score?: number | null
      }

      const quizAttempts: AttemptScore[] = await prisma.quizAttempt.findMany({
        where: { userId: user.id, score: { not: null } },
        select: { score: true },
      })

      const avgQuizScore =
        quizAttempts.length > 0
          ? Math.round(
              quizAttempts.reduce(
                (sum: number, attempt: AttemptScore) =>
                  sum + (attempt.score || 0),
                0
              ) / quizAttempts.length
            )
          : 0

      // 🏅 Certificates earned (only VERIFIED)
      const totalCertificates = await prisma.certificate.count({
        where: {
          studentId: user.id,
          status: "VERIFIED",
        },
      })

      // 📊 Weekly progress (based on lesson completions)
      const now = new Date()
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 6)

      const records = await prisma.progressRecord.findMany({
        where: {
          userId: user.id,
          completedAt: { gte: sevenDaysAgo },
        },
        select: { completedAt: true },
      })

      // 🗓️ Group by day
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(sevenDaysAgo)
        d.setDate(sevenDaysAgo.getDate() + i)
        const label = d.toLocaleDateString("en-US", { weekday: "short" })
        const count = records.filter(
          (r) => r.completedAt.toDateString() === d.toDateString()
        ).length
        const hours = Math.round((count * 15) / 60)
        return { day: label, hours }
      })

      return NextResponse.json(
        {
          role: "student",
          totalHours,
          avgQuizScore,
          totalCertificates,
          weeklyData: days,
        },
        { status: 200 }
      )
    }

    //
    // 👨‍🏫 For Staff/Admin roles → can be extended later
    //
    return NextResponse.json(
      { message: "Insights currently available for students only" },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("❌ GET /progress/insights error:", error)
    const err = error as Error
    return NextResponse.json(
      { error: "Failed to fetch progress insights", details: err.message },
      { status: 500 }
    )
  }
}
