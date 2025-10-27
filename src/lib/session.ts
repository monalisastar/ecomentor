import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { headers, cookies } from "next/headers"
import type { Session } from "next-auth"

/**
 * ✅ Universal getSession helper for App Router + API routes
 * Reads cookies and headers automatically — fully compatible with Next.js 15+
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions)
    return session as Session | null
  } catch (error) {
    console.error("Error fetching session:", error)
    return null
  }
}
