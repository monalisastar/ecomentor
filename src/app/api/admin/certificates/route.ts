import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 🧾 GET /api/admin/certificates
 * Returns all certificates for the admin dashboard,
 * including student name, course title, and blockchain data.
 */
export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        enrollment: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    })

    // ✅ Map & format results for frontend
    const formatted = certificates.map((c) => ({
      id: c.id,
      studentName: c.user?.name || 'Unknown Student',
      courseTitle: c.enrollment?.course?.title || 'Unknown Course',
      issueDate: c.issueDate,
      status: c.status,
      verifiedBy: c.verifiedBy,
      issuedBy: c.issuedBy,
      // ✅ Blockchain data
      blockchainTx: c.blockchainTx,
      blockchainContract: c.blockchainContract,
      blockchainNetwork: c.blockchainNetwork,
      metadataURI: c.metadataURI,
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (err: any) {
    console.error('❌ Error fetching certificates:', err)
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}
