import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ GET /api/users
 * ---------------------------------------------------------
 * Returns a list of all registered users on the platform.
 * Accessible only by admins.
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Verify session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🎩 Ensure only admins can access
    const adminUser = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isAdmin = adminUser?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧩 Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        status: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("❌ Failed to fetch users:", error)
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    )
  }
}
