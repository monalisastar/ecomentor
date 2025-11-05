import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import PDFDocument from "pdfkit"
import { Readable } from "stream"
import QRCode from "qrcode"
import fs from "fs"
import path from "path"
import { supabase } from "@/lib/supabase"

/**
 * 📄 GET /api/certificates/pdf/[slug]
 * ---------------------------------------------------------
 * Generates and streams a verified PDF certificate to the user.
 * - Authenticates student
 * - Verifies certificate
 * - Fetches design + renders PDF with QR verification
 * - Uploads to Supabase
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  try {
    // 🔒 Authenticate student
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧩 Fetch user and certificate data
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, name: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const cert = await prisma.certificate.findFirst({
      where: { studentId: user.id, courseSlug: slug },
    })
    if (!cert)
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )

    // 🚫 Only verified certs can be downloaded
    if (cert.status !== "VERIFIED")
      return NextResponse.json(
        { error: "Certificate not yet verified by staff" },
        { status: 403 }
      )

    // 🎯 Extract key info
    const studentName = cert.studentName || user.name || "Student"
    const courseTitle = cert.courseTitle || "Eco-Mentor Course"
    const issueDate = cert.issueDate
      ? new Date(cert.issueDate).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB")
    const verificationUrl = cert.verificationUrl

    // 🧾 Generate QR code
    const qrBuffer = await QRCode.toBuffer(verificationUrl)

    // 🧱 Fetch lecturer’s saved design (Prisma)
    let design = await prisma.certificateDesign.findUnique({
      where: { createdBy: cert.issuedBy ?? "" },
      select: {
        logoUrl: true,
        signatureUrl: true,
        backgroundUrl: true,
        color: true,
      },
    })

    // 🎨 Fallbacks
    const primaryColor = design?.color || "#1B5E20"
    const logoUrl =
      design?.logoUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/eco-mentor-logo.png`
    const signatureUrl =
      design?.signatureUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/Signature_2.webp`
    const backgroundUrl = design?.backgroundUrl || null

    // 📄 Build the PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    // 🪶 Font
    const fontPath = path.resolve("./public/fonts/Roboto-Regular.ttf")
    if (fs.existsSync(fontPath)) doc.font(fontPath)

    // 🖼️ Optional background (fixed opacity)
    if (backgroundUrl) {
      try {
        const bgRes = await fetch(backgroundUrl)
        const bgBuffer = Buffer.from(await bgRes.arrayBuffer())

        // ✅ PDFKit doesn’t support opacity inside .image(), so use .opacity()
        doc.save()
        doc.opacity(0.1)
        doc.image(bgBuffer, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        })
        doc.restore()
      } catch {
        console.warn("⚠️ Background not loaded")
      }
    }

    // 🎨 Border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .strokeColor(primaryColor)
      .lineWidth(2)
      .stroke()

    // 🌿 Logo
    try {
      const logoRes = await fetch(logoUrl)
      const logoBuffer = Buffer.from(await logoRes.arrayBuffer())
      doc.image(logoBuffer, 50, 40, { width: 90 })
    } catch {
      console.warn("⚠️ Logo not loaded — continuing")
    }

    // 🏆 Title
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .text("Certificate of Completion", { align: "center", underline: true })
      .moveDown(2)

    // 👤 Recipient
    doc
      .fontSize(16)
      .fillColor("#333")
      .text("This certifies that", { align: "center" })
      .moveDown(1)
      .fontSize(24)
      .fillColor("#000")
      .text(studentName, { align: "center", underline: true })
      .moveDown(1)
      .fontSize(16)
      .fillColor("#333")
      .text("has successfully completed the course:", { align: "center" })
      .moveDown(0.5)
      .fontSize(20)
      .fillColor(primaryColor)
      .text(courseTitle, { align: "center" })
      .moveDown(2)

    // 📅 Issue info
    doc
      .fontSize(14)
      .fillColor("#555")
      .text(`Issued on ${issueDate}`, { align: "center" })
      .moveDown(1)

    // ✍️ Signature
    try {
      const sigRes = await fetch(signatureUrl)
      const sigBuffer = Buffer.from(await sigRes.arrayBuffer())
      doc.image(sigBuffer, doc.page.width / 2 - 100, 520, { width: 100 })
    } catch {
      console.warn("⚠️ Signature not loaded — continuing")
    }

    doc
      .fontSize(12)
      .fillColor("#333")
      .text("Authorized Lecturer", doc.page.width / 2 - 50, 630, {
        align: "center",
      })
      .text("Eco-Mentor Academy", { align: "center" })

    // 🔗 QR Code
    doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 180, {
      width: 100,
    })
    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Scan to verify", doc.page.width - 140, doc.page.height - 75)

    // ✅ Finalize
    doc.end()
    await new Promise((resolve) => doc.on("end", resolve))
    const pdfBuffer = Buffer.concat(chunks)

    // ☁️ Upload PDF to Supabase Storage
    const fileName = `${slug}-${user.id}-certificate.pdf`
    const { data: uploaded, error: uploadErr } = await supabase.storage
      .from("ecomentor-assets")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      })
    if (uploadErr) console.error("❌ Supabase upload failed:", uploadErr)

    // 🌐 Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("ecomentor-assets")
      .getPublicUrl(fileName)
    const publicUrl = publicUrlData?.publicUrl || null

    // 🧾 Update certificate record
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { certificateUrl: publicUrl },
    })

    // 🎉 Stream PDF inline
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}-certificate.pdf"`,
      },
    })
  } catch (err: any) {
    console.error("❌ Error generating certificate PDF:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    )
  }
}
