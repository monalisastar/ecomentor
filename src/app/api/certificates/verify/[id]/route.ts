import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

/**
 * PATCH /api/certificates/verify/[id]
 * ---------------------------------------------------------
 * Marks a certificate as VERIFIED or REVOKED.
 * If VERIFIED, prepares it for minting (on-chain registration).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // 🔒 Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧑‍🏫 Ensure staff or admin privileges
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })

    const isStaff = user?.roles?.some((r) =>
      ["lecturer", "admin"].includes(r)
    )
    if (!isStaff)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🧩 Parse request
    const body = await req.json()
    const { action, txHash, contractAddress, network } = body

    if (!["VERIFIED", "REVOKED"].includes(action))
      return NextResponse.json(
        { error: "Invalid action (use VERIFIED or REVOKED)" },
        { status: 400 }
      )

    // ⚙️ Update certificate
    const dataToUpdate: any = {
      status: action,
      verifiedBy: token.email,
    }

    // 🪙 If verified & includes blockchain info — store it
    if (action === "VERIFIED" && txHash) {
      dataToUpdate.blockchainTx = txHash
      dataToUpdate.blockchainContract = contractAddress
      dataToUpdate.blockchainNetwork = network || "polygon-amoy"
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        studentName: true,
        courseTitle: true,
        status: true,
        verifiedBy: true,
        blockchainTx: true,
        blockchainContract: true,
        blockchainNetwork: true,
      },
    })

    // 🧾 Response
    return NextResponse.json(
      {
        message:
          action === "VERIFIED"
            ? "✅ Certificate verified successfully."
            : "⚠️ Certificate revoked.",
        certificate: updated,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error("❌ Error updating certificate:", err)
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    )
  }
}
