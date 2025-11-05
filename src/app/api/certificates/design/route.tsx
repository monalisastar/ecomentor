import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * ✅ POST /api/certificates/design
 * ---------------------------------------------------------
 * Saves or updates a lecturer’s certificate design layout.
 * Stores: logoUrl, signatureUrl, backgroundUrl, color
 * Tied to the authenticated user (lecturer/staff).
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    const { logoUrl, signatureUrl, backgroundUrl, color } = body as {
      logoUrl?: string
      signatureUrl?: string
      backgroundUrl?: string
      color?: string
    }

    // 🧩 Upsert (create if not exists, update otherwise)
    const design = await prisma.certificateDesign.upsert({
      where: { createdBy: user.id },
      update: { logoUrl, signatureUrl, backgroundUrl, color },
      create: {
        createdBy: user.id,
        logoUrl,
        signatureUrl,
        backgroundUrl,
        color,
      },
    })

    return NextResponse.json(design)
  } catch (err: any) {
    console.error("❌ Error saving certificate design:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    )
  }
}

/**
 * ✅ GET /api/certificates/design
 * ---------------------------------------------------------
 * Retrieves the lecturer’s saved design layout.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const design = await prisma.certificateDesign.findUnique({
      where: { createdBy: user.id },
    })

    return NextResponse.json(design || {})
  } catch (err: any) {
    console.error("❌ Error fetching certificate design:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    )
  }
}
