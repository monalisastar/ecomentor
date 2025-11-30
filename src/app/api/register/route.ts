import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, confirmPassword } = body

    if (!name || !email || !password)
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 })

    if (password !== confirmPassword)
      return NextResponse.json({ error: "PASSWORD_MISMATCH" }, { status: 400 })

    // 🔍 Check existing user
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      // ⭐ This is the change — return USER_EXISTS
      return NextResponse.json({ status: "USER_EXISTS" }, { status: 200 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: ["student"],
        emailVerified: null,
        status: "INVITED",
      },
    })

    // Optional email verification
    fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    return NextResponse.json(
      { status: "REGISTERED", message: "Account created." },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}
