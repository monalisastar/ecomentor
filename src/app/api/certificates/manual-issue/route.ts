import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import { mintCertificateOnChain } from "@/lib/blockchain/mint"
import { uploadMetadata } from "@/lib/metadata/uploadMetadata"

/**
 * ✅ POST /api/certificates/manual-issue
 * ---------------------------------------------------------
 * Allows staff/admins to manually issue a certificate.
 * - Auto-generates metadata JSON (uploads to Supabase)
 * - Auto-verifies and mints if admin settings allow
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Authenticate admin/staff
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isStaff = user?.roles?.some((r) => ["staff", "admin"].includes(r))
    if (!isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧠 Parse request body
    const { studentId, courseSlug, courseTitle } = await req.json()
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

    // 👩‍🎓 Fetch student name
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true },
    })
    const studentName = student?.name ?? "Unnamed Student"

    // 🧭 Generate verification details
    const verificationId = `EM-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationId}`

    // ⚙️ Get admin settings
    const settings = await prisma.adminSettings.findFirst()

    // 🧾 Create the certificate (initially PENDING or VERIFIED)
    let cert = await prisma.certificate.create({
      data: {
        studentId,
        studentName,
        courseSlug,
        courseTitle: courseTitle ?? "Untitled Course",
        verificationId,
        verificationUrl,
        issuedBy: "Eco-Mentor Staff",
        status: settings?.autoVerifyCertificates ? "VERIFIED" : "PENDING",
      },
    })

    // 📦 Generate and upload metadata JSON to Supabase
    let metadataURI = ""
    try {
      metadataURI = await uploadMetadata(cert)

      // 🧩 Attach metadataURI to certificate record
      cert = await prisma.certificate.update({
        where: { id: cert.id },
        data: { qrCodeUrl: metadataURI }, // optional, or create a new field like `metadataURI`
      })
    } catch (metaErr) {
      console.error("⚠️ Metadata upload failed:", metaErr)
    }

    // 🪙 Auto-mint if both toggles are enabled
    if (settings?.autoVerifyCertificates && settings?.blockchainMintingEnabled) {
      console.log("⛓️ Auto-minting enabled for manual issue...")
      try {
        const minted = await mintCertificateOnChain(cert, metadataURI)
        return NextResponse.json({
          message: "Certificate issued, verified, and minted automatically.",
          cert: minted,
        })
      } catch (err) {
        console.error("❌ Minting failed:", err)
        return NextResponse.json({
          message:
            "Certificate verified but blockchain minting failed (manual retry needed).",
          cert,
        })
      }
    }

    // 🟢 Default success response
    return NextResponse.json(
      {
        message: settings?.autoVerifyCertificates
          ? "Certificate issued and verified."
          : "Certificate manually issued (pending verification).",
        cert,
      },
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
