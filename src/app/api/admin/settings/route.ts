import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ GET /api/admin/settings
 * Fetch current system and certificate default settings
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 🔒 Ensure only admins can access
  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, roles: true, name: true },
  })
  if (!user?.roles?.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // 🧠 Load certificate design created by this admin (if any)
  const certDesign = await prisma.certificateDesign.findFirst({
    where: { createdBy: user.id },
  })

  const settings = {
    issuerName: user?.name || "Eco-Mentor Climate LMS",
    verifiedBy: "Administrator",
    logoUrl: certDesign?.logoUrl || null,
    signatureUrl: certDesign?.signatureUrl || null,
    backgroundUrl: certDesign?.backgroundUrl || null,
    certificateColor: certDesign?.color || "#1B5E20",
    maintenanceMode: false,
    autoVerifyCertificates: false,
    enrollmentLocked: false,
    emailNotifications: true,
    weeklyReports: false,
    debugLogging: false,
  }

  return NextResponse.json(settings)
}

/**
 * ✅ PATCH /api/admin/settings
 * Save updated settings to Prisma
 */
export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 🔒 Check for admin privileges
  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, roles: true },
  })
  if (!user?.roles?.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  // 🧩 Update or create certificate design record
  const updated = await prisma.certificateDesign.upsert({
    where: { createdBy: user.id },
    update: {
      logoUrl: body.logoUrl,
      signatureUrl: body.signatureUrl,
      backgroundUrl: body.backgroundUrl,
      color: body.certificateColor,
      updatedAt: new Date(),
    },
    create: {
      createdBy: user.id,
      logoUrl: body.logoUrl,
      signatureUrl: body.signatureUrl,
      backgroundUrl: body.backgroundUrl,
      color: body.certificateColor,
    },
  })

  // (Optional) You can persist other toggles in a separate table later
  return NextResponse.json({ success: true, certificateDesign: updated })
}
