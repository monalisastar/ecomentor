import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/mailer"

/**
 * POST /api/forgot-password
 * ----------------------------------------------------------
 * Generates a secure reset token, stores it on the user record,
 * and emails the password reset link to the user.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    // 🔍 Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email." },
        { status: 404 }
      )
    }

    // 🧩 Create a secure token (valid for 30 minutes)
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    // 💾 Save token on user record
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    })

    // ✉️ Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
    await sendPasswordResetEmail({
      email,
      name: user.name || "User",
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Forgot password error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
