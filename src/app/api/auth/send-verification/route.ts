import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import nodemailer from "nodemailer"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 })

    // 🧠 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🧩 2. Generate token & expiry (1 hour)
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600 * 1000)

    // 💾 3. Save token in VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // 🔗 4. Construct verification link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`

    // 📧 5. Set up Nodemailer (free Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // ✉️ 6. Send email
    await transporter.sendMail({
      from: `"Eco-Mentor Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Eco-Mentor account",
      html: `
        <div style="font-family:sans-serif;line-height:1.5">
          <h2>Verify your email address</h2>
          <p>Click the button below to verify your account:</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#22c55e;color:white;border-radius:8px;text-decoration:none">Verify Email</a>
          <p>If the button doesn’t work, copy and paste this link into your browser:</p>
          <p>${verifyUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: "Verification email sent!" })
  } catch (error) {
    console.error("❌ Email verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}
