import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ PATCH /api/admin/staff/[id]
 * Allows admin to update staff status (INVITED, ACTIVE, SUSPENDED)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const userRole =
    (token as any)?.role ||
    (Array.isArray((token as any)?.roles)
      ? (token as any).roles[0]
      : "student")

  // 🔒 Restrict to admin only
  if (!token?.email || userRole !== "admin") {
    console.warn(`🚫 Unauthorized PATCH attempt by ${token?.email}`)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = params
  const { status } = await req.json()

  // 🧩 Validate status
  const allowedStatuses = ["INVITED", "ACTIVE", "SUSPENDED"]
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true, roles: true },
    })

    console.log(`✅ Staff ${updated.email} status → ${updated.status}`)
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("❌ Failed to update staff status:", err.message)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
