import type { NextAuthOptions } from "next-auth"
import { authOptions as sharedOptions } from "@/lib/authOptions"

/**
 * 🪄 Bridge for getServerSession
 * Pulls from sharedOptions without touching your route.ts.
 */
export const authOptions: NextAuthOptions = {
  ...sharedOptions,
}
