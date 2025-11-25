import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

/**
 * ✅ GET /api/courses/recommended
 * ---------------------------------------------------------
 * Returns a random selection of 6 published courses
 * for the logged-in student.
 * (Later, logic can be personalized by category or tags)
 */
export async function GET() {
  try {
    // 🔐 Authenticate
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 🧠 Fetch all published courses
    const allCourses = await prisma.course.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        category: true,
      },
    })

    if (!allCourses.length) {
      return NextResponse.json([], { status: 200 })
    }

    // 🎲 Shuffle & pick up to 6
    const shuffled = allCourses.sort(() => 0.5 - Math.random())
    const randomSelection = shuffled.slice(0, 6)

    return NextResponse.json(randomSelection, { status: 200 })
  } catch (error: unknown) {
    console.error("❌ GET /courses/recommended error:", error)
    const err = error as Error
    return NextResponse.json(
      { error: "Failed to fetch recommended courses", details: err.message },
      { status: 500 }
    )
  }
}
