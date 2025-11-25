import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 🎓 GET /api/certificates/[id]
 * ---------------------------------------------------------
 * Fetches one certificate and its related course info.
 * Uses courseSlug since no direct relation exists.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 🔍 1️⃣ Fetch certificate first
    const cert = await prisma.certificate.findUnique({
      where: { id },
    })

    if (!cert)
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })

    // 🔍 2️⃣ Look up course using courseSlug
    let course = null
    if (cert.courseSlug) {
      course = await prisma.course.findUnique({
        where: { slug: cert.courseSlug },
        select: { title: true, image: true, slug: true },
      })
    }

    // 🧩 3️⃣ Normalize status
    const statusMap: Record<string, string> = {
      VERIFIED: 'Verified',
      PENDING: 'In Progress',
      REVOKED: 'Revoked',
    }
    const normalizedStatus =
      statusMap[String(cert.status).toUpperCase()] || 'Unknown'

    // 🪪 4️⃣ Format the response
    const formatted = {
      id: cert.id,
      title: cert.courseTitle || 'Untitled Course',
      courseSlug: cert.courseSlug,
      issuedDate: cert.issueDate
        ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Pending Issue',
      status: normalizedStatus,
      verificationUrl: cert.verificationUrl,
      certificateUrl: cert.certificateUrl,
      blockchainTx: cert.blockchainTx,
      blockchainContract: cert.blockchainContract,
      blockchainNetwork: cert.blockchainNetwork,
      issuedBy: cert.issuedBy,
      verifiedBy: cert.verifiedBy,
      course, // 🧠 now included manually
    }

    return NextResponse.json(formatted, { status: 200 })
  } catch (error: any) {
    console.error('❌ [GET /api/certificates/:id] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message || 'Unexpected failure',
      },
      { status: 500 }
    )
  }
}
