import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 })

    // 1️⃣  Find token record
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!record)
      return NextResponse.json({ error: "Invalid or used token" }, { status: 400 })

    if (record.expires < new Date())
      return NextResponse.json({ error: "Token expired" }, { status: 400 })

    // 2️⃣  Mark user as verified
    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date(), status: "ACTIVE" },
    })

    // 3️⃣  Delete the token to prevent reuse
    await prisma.verificationToken.delete({ where: { token } })

    // 4️⃣  Redirect or return message
    return NextResponse.redirect(new URL("/login?verified=true", req.url))
  } catch (err) {
    console.error("❌ Verify route error:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
