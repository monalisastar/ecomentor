import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function GET() {
  await sendPasswordResetEmail({
    email: "yourtestemail@example.com",
    name: "Test User",
    resetUrl: "http://localhost:3000/reset-password?token=demo123",
  });

  return NextResponse.json({ message: "✅ Test email sent successfully" });
}
