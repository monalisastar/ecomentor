import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

const SPECIAL_EMAILS = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com"
]

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let roles: string[] = ["student"]
    if (SPECIAL_EMAILS.includes(email)) {
      roles = ["student", "lecturer", "admin"]
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: { set: roles }, // ✅ FIX
      },
    })

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
