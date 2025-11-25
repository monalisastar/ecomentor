import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // 🔐 Validate user session
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

  // 🧩 Parse data
  const { id } = params
  const body = await req.json()
  const note = body.note?.trim()

  if (!note)
    return NextResponse.json({ error: "Empty note" }, { status: 400 })

  // 🗂️ Update record
  const saved = await prisma.course.update({
    where: { id },
    data: {
      instructorNotes: note,
      adminStatus: "UNDER_REVIEW",
    },
  })

  return NextResponse.json(saved)
}
