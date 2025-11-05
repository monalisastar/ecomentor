import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ PATCH /api/admin/courses/[id]
 * Update the adminStatus of a course (APPROVED, UNDER_REVIEW, REVOKED)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔐 Authenticate request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 🧠 Verify admin privileges
  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { roles: true },
  })
  if (!user?.roles?.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // 🧩 Parse parameters and body
  const { id } = params
  const { adminStatus } = await req.json()

  if (!["APPROVED", "UNDER_REVIEW", "REVOKED"].includes(adminStatus))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })

  // 🧱 Update course
  const updated = await prisma.course.update({
    where: { id },
    data: { adminStatus },
  })

  return NextResponse.json(updated)
}
