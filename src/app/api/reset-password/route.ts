import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

/**
 * POST /api/reset-password
 * ----------------------------------------------------------
 * Resets a user's password after verifying the reset token.
 */
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      )
    }

    // 🔍 Find user by token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // still valid
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // 🔒 Hash new password and clear token
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
