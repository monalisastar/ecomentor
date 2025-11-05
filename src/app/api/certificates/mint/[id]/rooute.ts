import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { ethers } from "ethers"
import prisma from "@/lib/prisma"

const CONTRACT_ADDRESS = process.env.ECO_CERT_CONTRACT!
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const RPC_URL = process.env.POLYGON_AMOY_RPC_URL!

const ABI = [
  "function mintCertificate(address student, string uri) external",
  "event CertificateMinted(address indexed to, uint256 tokenId, string uri)",
]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isAuthorized = user?.roles?.some((r) =>
      ["admin", "lecturer"].includes(r)
    )
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { metadataURI } = await req.json()
    if (!metadataURI)
      return NextResponse.json({ error: "Missing metadata URI" }, { status: 400 })

    // ⚙️ Connect to Polygon
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)

    // 🪙 Mint to platform's own address
    const issuerAddress = await wallet.getAddress()
    const tx = await contract.mintCertificate(issuerAddress, metadataURI)
    await tx.wait()

    // 🧭 Save blockchain info
    const updated = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        status: "VERIFIED",
        verifiedBy: token.email,
        blockchainTx: tx.hash,
        blockchainContract: CONTRACT_ADDRESS,
        blockchainNetwork: "polygon-amoy",
      },
    })

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
