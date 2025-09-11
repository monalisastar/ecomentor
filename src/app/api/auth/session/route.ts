// src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";

// 👇 Always return a fake "logged-in" user
export async function GET() {
  return NextResponse.json({
    user: {
      id: "mock-id",
      name: "Developer User",
      email: "dev@example.com",
    },
    expires: "2099-12-31T23:59:59.999Z",
  });
}
