import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// ✅ Match Prisma role structure
type Role = "student" | "lecturer" | "admin";

const specialEmails = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com",
];

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        // ✅ Instant login for special emails
        if (specialEmails.includes(email)) {
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0],
                roles: ["admin"],
                password: "",
              },
            });
          }

          return {
            id: user.id,
            name: user.name ?? email.split("@")[0],
            email: user.email,
            image: user.image ?? null,
            role: (user.roles?.[0] as Role) || "admin",
          } as User & { role: Role };
        }

        // 🔒 Normal user login
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("No user found");

        const valid = await bcrypt.compare(password, user.password ?? "");
        if (!valid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name ?? email.split("@")[0],
          email: user.email,
          image: user.image ?? null,
          role: (user.roles?.[0] as Role) || "student",
        } as User & { role: Role };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  //
  // ✅ FIX: Cookie override to allow session on localhost (no HTTPS)
  //
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // false on localhost
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        const email = user.email.toLowerCase();

        let existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: { email, roles: ["student"], password: "" },
          });
        }

        (user as { role?: Role }).role =
          (existingUser.roles?.[0] as Role) || "student";
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: Role }).role || "student";
      }
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: Role }).role =
          (token.role as Role) || "student";
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
