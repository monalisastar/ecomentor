import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, confirmPassword } = body

    // 🧩 Validate fields
    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })

    if (password !== confirmPassword)
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })

    // 🔍 Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ error: "User already exists" }, { status: 400 })

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🧠 Create user (unverified by default)
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

    // ✉️ Send verification email
    await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
