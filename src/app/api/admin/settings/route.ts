import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ GET /api/admin/settings
 * Fetch current system, branding, and certificate default settings
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 🔒 Only admins allowed
  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, roles: true, name: true },
  })
  if (!user?.roles?.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // 🎨 Certificate Design (personal to this admin)
  const certDesign = await prisma.certificateDesign.findFirst({
    where: { createdBy: user.id },
  })

  // ⚙️ System Settings (global)
  let settings = await prisma.adminSettings.findFirst()
  if (!settings) {
    settings = await prisma.adminSettings.create({
      data: {
        platformName: "Eco-Mentor LMS",
        supportEmail: "support@eco-mentor.org",
        primaryBrandColor: "#1B5E20",
        issuerName: "Eco-Mentor Climate LMS",
        verifiedByDefault: "Administrator",
        maintenanceMode: false,
        autoVerifyCertificates: false,
        blockchainMintingEnabled: false,
      },
    })
  }

  // 🧩 Merge and Normalize Output
  return NextResponse.json({
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    brandColor: settings.primaryBrandColor,
    defaultLanguage: settings.defaultLanguage ?? "en",
    issuerName: certDesign?.createdBy ? certDesign.createdBy : settings.issuerName,
    verifiedBy: settings.verifiedByDefault,
    logoUrl: certDesign?.logoUrl || null,
    signatureUrl: certDesign?.signatureUrl || null,
    backgroundUrl: certDesign?.backgroundUrl || null,
    certificateColor: certDesign?.color || settings.primaryBrandColor,
    maintenanceMode: settings.maintenanceMode,
    autoVerifyCertificates: settings.autoVerifyCertificates,
    enrollmentLocked: settings.enrollmentLock,
    emailNotifications: settings.emailNotifications,
    weeklyReports: settings.weeklyReportsToAdmins,
    debugLogging: settings.enableDebugLogging,
    blockchainMintingEnabled: settings.blockchainMintingEnabled,
    blockchainNetworkDefault: settings.blockchainNetworkDefault || "polygon-amoy",
    blockchainContractDefault: settings.blockchainContractDefault || process.env.ECO_CERT_CONTRACT,
  })
}

/**
 * ✅ PATCH /api/admin/settings
 * Update certificate design + global admin settings
 */
export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, roles: true },
  })
  if (!user?.roles?.includes("admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  // 🎨 Update Certificate Design for this admin
  const design = await prisma.certificateDesign.upsert({
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

  // ⚙️ Update Global Admin Settings
  const settings = await prisma.adminSettings.upsert({
    where: { id: body.id || "global-admin-settings" },
    update: {
      platformName: body.platformName,
      supportEmail: body.supportEmail,
      primaryBrandColor: body.brandColor,
      defaultLanguage: body.defaultLanguage,
      issuerName: body.issuerName,
      verifiedByDefault: body.verifiedBy,
      maintenanceMode: body.maintenanceMode,
      autoVerifyCertificates: body.autoVerifyCertificates,
      enrollmentLock: body.enrollmentLocked,
      emailNotifications: body.emailNotifications,
      weeklyReportsToAdmins: body.weeklyReports,
      enableDebugLogging: body.debugLogging,
      blockchainMintingEnabled: body.blockchainMintingEnabled,
      blockchainNetworkDefault: body.blockchainNetworkDefault,
      blockchainContractDefault: body.blockchainContractDefault,
      updatedAt: new Date(),
    },
    create: {
      platformName: body.platformName,
      supportEmail: body.supportEmail,
      primaryBrandColor: body.brandColor,
      defaultLanguage: body.defaultLanguage,
      issuerName: body.issuerName,
      verifiedByDefault: body.verifiedBy,
      maintenanceMode: body.maintenanceMode,
      autoVerifyCertificates: body.autoVerifyCertificates,
      enrollmentLock: body.enrollmentLocked,
      emailNotifications: body.emailNotifications,
      weeklyReportsToAdmins: body.weeklyReports,
      enableDebugLogging: body.debugLogging,
      blockchainMintingEnabled: body.blockchainMintingEnabled,
      blockchainNetworkDefault: body.blockchainNetworkDefault,
      blockchainContractDefault: body.blockchainContractDefault,
    },
  })

  return NextResponse.json({
    success: true,
    certificateDesign: design,
    settings,
  })
}
