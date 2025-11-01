// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      image?: string | null
      roles: string[]
      role?: "student" | "lecturer" | "admin"
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    email: string
    image?: string | null
    roles: string[]
    role?: "student" | "lecturer" | "admin"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string
    roles?: string[]
    role?: "student" | "lecturer" | "admin"
  }
}
