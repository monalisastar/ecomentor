import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * 🎓 GET /api/certificates
 * ---------------------------------------------------------
 * Returns all certificates belonging to the authenticated student,
 * including course info (via Enrollment → Course).
 */
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2️⃣ Get user
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, name: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3️⃣ Fetch certificates → include enrollment + course
    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: user.id,
        status: { in: ['PENDING', 'VERIFIED', 'REVOKED'] },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 4️⃣ Status + Thumbnail fallback maps
    const statusMap: Record<string, string> = {
      VERIFIED: 'Verified',
      PENDING: 'In Progress',
      REVOKED: 'Revoked',
    }

    const thumbnailMap: Record<string, string> = {
      VERIFIED: '/images/certificate-green.webp',
      PENDING: '/images/certificate-yellow.webp',
      REVOKED: '/images/certificate-red.webp',
    }

    // 5️⃣ Format response
    const formatted = await Promise.all(
      certificates.map(async (cert) => {
        const rawStatus = String(cert.status).toUpperCase()

        // 🖼️ Prefer course image from Supabase bucket
        let imageUrl =
          cert.enrollment?.course?.image || thumbnailMap[rawStatus] || null

        if (imageUrl && !imageUrl.startsWith('http')) {
          const { data } = supabaseAdmin.storage
            .from('eco-mentor-assets')
            .getPublicUrl(imageUrl)
          imageUrl = data?.publicUrl || imageUrl
        }

        return {
          id: cert.id,
          title:
            cert.courseTitle ||
            cert.enrollment?.course?.title ||
            'Untitled Course',
          courseSlug:
            cert.courseSlug || cert.enrollment?.course?.slug || '',
          issuedDate: cert.issueDate
            ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Pending Issue',
          status: statusMap[rawStatus] ?? 'Unknown',
          thumbnail: imageUrl,
          certificateUrl: cert.certificateUrl || '',
          verificationUrl: cert.verificationUrl || '',
          blockchainTx: cert.blockchainTx ?? null,
          blockchainContract: cert.blockchainContract ?? null,
          blockchainNetwork: cert.blockchainNetwork ?? null,
          verifiedBy: cert.verifiedBy ?? 'Not verified yet',
          issuedBy: cert.issuedBy ?? 'Eco-Mentor Climate LMS',
          course: {
            title: cert.enrollment?.course?.title,
            image: imageUrl,
            slug: cert.enrollment?.course?.slug,
          },
        }
      })
    )

    return NextResponse.json(formatted, { status: 200 })
  } catch (error: any) {
    console.error('❌ [Certificates API] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
