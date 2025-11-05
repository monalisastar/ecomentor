import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * ✅ GET /api/admin/certificates
 * ---------------------------------------------------------
 * Returns all certificates with key metadata for admin review.
 * Only accessible to users with the 'admin' role.
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Authenticate admin user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    if (!user?.roles?.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 🧩 Fetch all certificates (aligned with your Prisma schema)
    const certificates = await prisma.certificate.findMany({
      select: {
        id: true,
        studentName: true,
        courseTitle: true,
        courseSlug: true,
        certificateUrl: true,
        verificationId: true,
        issueDate: true,
        status: true,
        type: true,
        verifiedBy: true,
      },
      orderBy: { issueDate: "desc" },
    })

    // ✅ Return response
    return NextResponse.json(certificates, { status: 200 })
  } catch (error) {
    console.error("❌ Failed to fetch certificates:", error)
    return NextResponse.json(
      { error: "Internal server error while fetching certificates" },
      { status: 500 }
    )
  }
}
