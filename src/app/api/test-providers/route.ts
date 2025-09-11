import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET() {
  const providerNames = authOptions.providers.map((p) => p.name);
  return NextResponse.json({ providers: providerNames });
}
