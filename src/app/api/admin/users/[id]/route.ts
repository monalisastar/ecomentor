import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

const PROTECTED_EMAILS = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
]

/**
 * ✅ PATCH /api/admin/users/[id]
 * Update user status (cannot suspend students or protected admins)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await req.json()

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = adminUser?.roles?.includes("admin")
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { roles: true, status: true, email: true },
    })
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🚫 Protect specific admin emails
    if (PROTECTED_EMAILS.includes(targetUser.email)) {
      return NextResponse.json(
        { error: "This admin account cannot be suspended" },
        { status: 400 }
      )
    }

    // 🚫 Prevent suspension of students
    if (targetUser.roles.includes("student") && status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Student accounts cannot be suspended" },
        { status: 400 }
      )
    }

    const validStatuses = ["ACTIVE", "SUSPENDED", "INVITED"]
    if (!validStatuses.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error("❌ Error updating user:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/**
 * 🗑️ DELETE /api/admin/users/[id]
 * Permanently remove suspended user accounts.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = adminUser?.roles?.includes("admin")
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { email: true, roles: true, status: true },
    })
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🚫 Prevent deleting students or protected admins
    if (targetUser.roles.includes("student"))
      return NextResponse.json({ error: "Cannot delete student accounts" }, { status: 400 })

    if (PROTECTED_EMAILS.includes(targetUser.email))
      return NextResponse.json({ error: "Protected admin account cannot be deleted" }, { status: 400 })

    // ✅ Only delete suspended users
    if (targetUser.status !== "SUSPENDED")
      return NextResponse.json({ error: "Only suspended users can be deleted" }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Error deleting user:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
