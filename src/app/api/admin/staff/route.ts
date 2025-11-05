import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ GET /api/admin/staff
 * Lists all staff and lecturers for admin dashboard
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const userRole =
    (token as any)?.role ||
    (Array.isArray((token as any)?.roles)
      ? (token as any).roles[0]
      : "student")

  if (!token?.email || userRole !== "admin") {
    console.warn("❌ Unauthorized access attempt:", token?.email, userRole)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const staff = await prisma.user.findMany({
    where: { roles: { hasSome: ["staff", "lecturer"] } },
    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json(staff)
}

/**
 * ✅ POST /api/admin/staff
 * Allows admin to invite/add new staff or lecturer
 */
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const userRole =
    (token as any)?.role ||
    (Array.isArray((token as any)?.roles)
      ? (token as any).roles[0]
      : "student")

  if (!token?.email || userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, email, role } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: "User already exists" }, { status: 400 })

  const newStaff = await prisma.user.create({
    data: {
      name,
      email,
      password: "",
      roles: [role || "staff"],
      status: "INVITED", // ✅ default
    },
  })

  return NextResponse.json(newStaff)
}
