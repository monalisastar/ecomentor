// src/app/api/auth/_log/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Auth log:", body);
  return NextResponse.json({ message: "Log received" });
}
