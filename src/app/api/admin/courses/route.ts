import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { roles: true },
  })

  if (!user?.roles.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(courses)
}
