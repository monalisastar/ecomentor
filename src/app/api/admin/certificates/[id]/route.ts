import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ PATCH /api/admin/certificates/[id]
 * ---------------------------------------------------------
 * Updates a certificate's status:
 *  - VERIFIED → approved by admin
 *  - REVOKED  → invalidated
 *  - PENDING  → restored for review
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // 🔒 Authenticate admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true, name: true },
    })

    if (!user?.roles?.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 📦 Parse and validate request body
    const { status } = await req.json()
    if (!["VERIFIED", "REVOKED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 🧠 Update certificate record
    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        status,
        verifiedBy: status === "VERIFIED" ? user.name || "Administrator" : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("❌ Failed to update certificate:", error)
    return NextResponse.json(
      { error: "Internal server error while updating certificate" },
      { status: 500 }
    )
  }
}
