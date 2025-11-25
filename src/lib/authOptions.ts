import type { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

type Role = "student" | "staff" | "admin";

const seededAccounts: Record<string, Role> = {
  "njatabrian648@gmail.com": "admin",
  "virginia.njata@gmail.com": "admin",
  "marvel@ecomentor.green": "staff",
  "chepkemboi@ecomentor.green": "staff",
  "brian@ecomentor.green": "staff",
  "virginia@ecomentor.green": "staff",
};

export const authOptions: NextAuthOptions = {
  providers: [
    // ⭐ Google Provider WITH REQUIRED PARAMS (fixes missing consent modal)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // ⭐ Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing email or password");

        const email = credentials.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("No account found for this email");

        if (!user.password)
          throw new Error("This account requires Google Sign-In");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        const isPrivileged =
          seededAccounts[email] ||
          user.roles.includes("admin") ||
          user.roles.includes("staff");

        if (!user.emailVerified && !isPrivileged) {
          throw new Error("Please verify your email before logging in.");
        }

        const enforcedRole: Role =
          seededAccounts[email] ||
          (user.roles?.[0] as Role) ||
          "student";

        // Ensure DB user has correct enforced role
        if (!user.roles?.includes(enforcedRole)) {
          await prisma.user.update({
            where: { email },
            data: { roles: [enforcedRole] },
          });
        }

        return {
          id: user.id,
          name: user.name ?? email.split("@")[0],
          email: user.email,
          image: user.image ?? null,
          roles: [enforcedRole],
        } as User & { roles: Role[] };
      },
    }),
  ],

  // ⭐ CALLBACKS (unchanged but cleaned)
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        const email = user.email.toLowerCase();
        const enforcedRole: Role = seededAccounts[email] || "student";

        let existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email,
              name: user.name ?? email.split("@")[0],
              roles: [enforcedRole],
              password: "",
              emailVerified: new Date(),
            },
          });
        } else if (!existingUser.roles.includes(enforcedRole)) {
          await prisma.user.update({
            where: { email },
            data: { roles: [enforcedRole] },
          });
        }

        (user as any).roles = [enforcedRole];
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.roles = (user as any).roles || ["student"];

      if (!token.roles && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { roles: true },
        });
        token.roles = dbUser?.roles || ["student"];
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).roles = token.roles || ["student"];
      }
      return session;
    },
  },

  pages: { signIn: "/login" },

  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,

  debug: true,
};
