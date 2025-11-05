import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * 🎓 POST /api/certificates/auto-issue
 * ---------------------------------------------------------
 * Automatically issues a "Pending" certificate for a student
 * once they complete a course (progress === 100).
 *
 * - Authenticates current student
 * - Checks for duplicates
 * - Creates a new PENDING certificate
 * - Prepares blockchain metadata placeholders
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧩 Parse body
    const { courseSlug, courseTitle } = await req.json()
    if (!courseSlug || !courseTitle)
      return NextResponse.json(
        { error: "Missing courseSlug or courseTitle" },
        { status: 400 }
      )

    // 🧠 Find student
    const student = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, name: true },
    })
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })

    // 🕵️ Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: { studentId: student.id, courseSlug },
    })
    if (existing)
      return NextResponse.json(
        { message: "Certificate already exists", certificate: existing },
        { status: 200 }
      )

    // 🔑 Generate unique verification ID + URL
    const verificationId = `EM-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`

    // 🧾 Create certificate with blockchain placeholders
    const newCert = await prisma.certificate.create({
      data: {
        studentId: student.id,
        studentName: student.name ?? "Unnamed Student",
        courseSlug,
        courseTitle,
        verificationId,
        verificationUrl,
        issuedBy: "Eco-Mentor Climate LMS",
        status: "PENDING",

        // 🪙 Blockchain placeholders
        blockchainTx: null,
        blockchainContract: null,
        blockchainNetwork: null,
      },
    })

    return NextResponse.json(
      { message: "Certificate created successfully", certificate: newCert },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Error issuing certificate:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
