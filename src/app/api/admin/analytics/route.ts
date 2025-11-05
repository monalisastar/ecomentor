import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isAdmin = user?.roles?.includes("admin")
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧮 Fetch recent 6 months analytics
    const enrollments = await prisma.enrollment.findMany({
      select: { enrolledAt: true },
      orderBy: { enrolledAt: "asc" },
    })

    const payments = await prisma.payment.findMany({
      select: { paidAt: true, amount: true },
      where: { status: "SUCCESS" },
      orderBy: { paidAt: "asc" },
    })

    // 🧠 Group data by month
    const monthly = new Map<string, { enrollments: number; revenue: number }>()
    for (const e of enrollments) {
      const key = new Date(e.enrolledAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
      const entry = monthly.get(key) || { enrollments: 0, revenue: 0 }
      entry.enrollments++
      monthly.set(key, entry)
    }

    for (const p of payments) {
      if (!p.paidAt) continue
      const key = new Date(p.paidAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
      const entry = monthly.get(key) || { enrollments: 0, revenue: 0 }
      entry.revenue += p.amount
      monthly.set(key, entry)
    }

    const trend = Array.from(monthly.entries())
      .map(([month, values]) => ({
        month,
        ...values,
      }))
      .slice(-6)

    return NextResponse.json({ trend })
  } catch (error: any) {
    console.error("❌ Analytics route failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
