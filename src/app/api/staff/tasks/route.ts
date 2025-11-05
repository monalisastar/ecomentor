import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * GET /api/staff/tasks
 * Fetch all pending staff tasks.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tasks = await prisma.staffTask.findMany({
      where: { isCompleted: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error("❌ Failed to load staff tasks:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
