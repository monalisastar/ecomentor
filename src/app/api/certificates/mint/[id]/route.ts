import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import { mintCertificateOnChain } from "@/lib/blockchain/mint"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isAuthorized = user?.roles?.some((r) =>
      ["admin", "staff"].includes(r)
    )
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { metadataURI } = await req.json()
    const certificate = await prisma.certificate.findUnique({
      where: { id: params.id },
    })
    if (!certificate)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })

    // ✅ Reuse the blockchain helper
    const updated = await mintCertificateOnChain(certificate, metadataURI)

    return NextResponse.json({
      success: true,
      message: "Certificate minted to Eco-Mentor wallet and verified on-chain.",
      certificate: updated,
    })
  } catch (err: any) {
    console.error("❌ Mint error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
