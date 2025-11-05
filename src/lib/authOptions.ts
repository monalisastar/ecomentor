import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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

export const authOptions: AuthOptions = {
  providers: [
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

        // 🧩 Determine correct role (from seeded map or DB)
        const enforcedRole: Role =
          seededAccounts[email] ||
          (user.roles?.[0] as Role) ||
          "student";

        // 🛠 Sync DB if outdated
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
          roles: [enforcedRole], // ✅ Always return array
        } as User & { roles: Role[] };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

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

      // 🧠 Ensure persisted users always reload roles from DB if missing
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
};
