import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import { mintCertificateOnChain } from "@/lib/blockchain/mint"
import { uploadMetadata } from "@/lib/metadata/uploadMetadata"

/**
 * 🎓 POST /api/certificates/auto-issue
 * ---------------------------------------------------------
 * Automatically issues a certificate only when:
 *  - Course progress = 100%
 *  - All lessons and quizzes are passed
 *  - Enrollment.completed == true
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 1️⃣ Authenticate current user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { courseSlug, courseTitle } = await req.json()
    if (!courseSlug || !courseTitle)
      return NextResponse.json(
        { error: "Missing courseSlug or courseTitle" },
        { status: 400 }
      )

    // 👩‍🎓 2️⃣ Get student
    const student = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, name: true },
    })
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })

    // 🔍 3️⃣ Check enrollment and completion status
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: student.id,
        course: { slug: courseSlug },
      },
      select: { id: true, completed: true, progress: true },
    })

    if (!enrollment)
      return NextResponse.json(
        { error: "Enrollment not found for this course" },
        { status: 404 }
      )

    if (!enrollment.completed || enrollment.progress < 100)
      return NextResponse.json(
        { error: "Course not yet completed" },
        { status: 403 }
      )

    // 🧩 4️⃣ Confirm all lessons and quizzes are passed
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    })
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const lessonProgress = await prisma.progressRecord.findMany({
      where: {
        userId: student.id,
        courseId: course.id,
      },
      select: { isPassed: true },
    })

    const allPassed =
      lessonProgress.length > 0 && lessonProgress.every((p) => p.isPassed)
    if (!allPassed)
      return NextResponse.json(
        { error: "Not all lessons or quizzes passed" },
        { status: 403 }
      )

    // 🕵️ 5️⃣ Prevent duplicates
    const existing = await prisma.certificate.findFirst({
      where: { studentId: student.id, courseSlug },
    })
    if (existing)
      return NextResponse.json(
        { message: "Certificate already exists", certificate: existing },
        { status: 200 }
      )

    // ⚙️ 6️⃣ Fetch system settings
    const settings = await prisma.adminSettings.findFirst()

    // 🧾 7️⃣ Generate verification details
    const verificationId = `EM-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`

    // 📜 8️⃣ Create certificate entry (PENDING or VERIFIED)
    let cert = await prisma.certificate.create({
      data: {
        studentId: student.id,
        studentName: student.name ?? "Unnamed Student",
        courseSlug,
        courseTitle,
        verificationId,
        verificationUrl,
        enrollmentId: enrollment.id,
        issuedBy: "Eco-Mentor Climate LMS",
        status: settings?.autoVerifyCertificates ? "VERIFIED" : "PENDING",
      },
    })

    // 📦 9️⃣ Generate + upload metadata JSON
    let metadataURI = ""
    try {
      metadataURI = await uploadMetadata(cert)
      cert = await prisma.certificate.update({
        where: { id: cert.id },
        data: { metadataURI },
      })
    } catch (metaErr) {
      console.error("⚠️ Metadata upload failed:", metaErr)
    }

    // 🪙 🔟 Optional blockchain minting
    if (settings?.autoVerifyCertificates && settings?.blockchainMintingEnabled) {
      try {
        const minted = await mintCertificateOnChain(cert, metadataURI)
        return NextResponse.json({
          message: "Certificate issued, verified, and minted automatically.",
          certificate: minted,
        })
      } catch (mintErr) {
        console.error("❌ Auto-mint failed:", mintErr)
        return NextResponse.json({
          message:
            "Certificate verified but blockchain minting failed (manual retry needed).",
          certificate: cert,
        })
      }
    }

    // ✅ 11️⃣ Default success (no auto mint)
    return NextResponse.json(
      {
        message: settings?.autoVerifyCertificates
          ? "Certificate issued and verified."
          : "Certificate created successfully (pending verification).",
        certificate: cert,
      },
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
