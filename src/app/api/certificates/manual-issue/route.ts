import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ✅ POST /api/certificates/manual-issue
 * ---------------------------------------------------------
 * Allows staff/admins to manually issue a certificate
 * if auto-issue didn’t trigger.
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Use NextRequest for correct typing
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧩 Verify staff/admin privileges
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    const isStaff = user?.roles?.some((r) => ["lecturer", "admin"].includes(r))
    if (!isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧠 Parse and validate body
    const body = await req.json()
    const { studentId, courseSlug, courseTitle } = body as {
      studentId?: string
      courseSlug?: string
      courseTitle?: string
    }

    if (!studentId || !courseSlug)
      return NextResponse.json(
        { error: "Missing fields (studentId, courseSlug required)" },
        { status: 400 }
      )

    // 🕵️ Prevent duplicates
    const existing = await prisma.certificate.findFirst({
      where: { studentId, courseSlug },
    })
    if (existing)
      return NextResponse.json(
        { error: "Certificate already exists" },
        { status: 409 }
      )

    // 🧩 Fetch student name safely
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true },
    })
    const studentName = student?.name ?? "Unnamed Student"

    // 🔑 Create verification ID and URL
    const verificationId = `EM-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`

    // ✅ Create certificate entry
    const cert = await prisma.certificate.create({
      data: {
        studentId,
        studentName,
        courseSlug,
        courseTitle: courseTitle ?? "Untitled Course",
        verificationId,
        verificationUrl,
        issuedBy: "Eco-Mentor Staff",
        status: "PENDING",
      },
    })

    return NextResponse.json(
      { message: "Certificate manually issued (pending verification)", cert },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("❌ Manual issue error:", err)
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    )
  }
}
