// src/app/api/auth/providers/route.ts
import { NextResponse } from "next/server";;;

// 👇 Pretend we have a simple "Credentials" provider
export async function GET() {
  return NextResponse.json({
    credentials: {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      signinUrl: "/login",
      callbackUrl: "/dashboard",
    },
  });
}
