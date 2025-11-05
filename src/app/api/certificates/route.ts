import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'

/**
 * 📜 GET /api/certificates
 * ---------------------------------------------------------
 * Returns all certificates belonging to the logged-in student.
 * Includes blockchain metadata for on-chain verified certificates.
 * Used by the student dashboard at /student/certifications.
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 1. Authenticate the user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 🧠 2. Find the logged-in student
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    })

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // 🎓 3. Fetch all certificates for this student
    const certificates = await prisma.certificate.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        courseTitle: true,
        courseSlug: true,
        status: true,
        issueDate: true,
        certificateUrl: true,
        verificationUrl: true,
        verificationId: true,

        // 🪙 Blockchain metadata (new)
        blockchainTx: true,
        blockchainContract: true,
        blockchainNetwork: true,
      },
    })

    // 🧩 4. Format results for frontend
    const formatted = certificates.map((c) => ({
      id: c.id,
      title: c.courseTitle,
      courseSlug: c.courseSlug,
      issuedDate: c.issueDate
        ? new Date(c.issueDate).toLocaleDateString()
        : 'Not issued',
      status:
        c.status === 'VERIFIED'
          ? 'Verified'
          : c.status === 'REVOKED'
          ? 'Revoked'
          : 'In Progress',
      thumbnail: '/images/certificate-placeholder.png', // fallback thumbnail
      blockchainTx: c.blockchainTx,
      blockchainContract: c.blockchainContract,
      blockchainNetwork: c.blockchainNetwork,
    }))

    // ✅ 5. Return response
    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('❌ Error fetching certificates:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
