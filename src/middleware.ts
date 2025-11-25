import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Permanent role overrides for seeded accounts
const seededRoleOverrides: Record<string, "admin" | "staff"> = {
  "njatabrian648@gmail.com": "admin",
  "virginia.njata@gmail.com": "admin",
  "brian@ecomentor.green": "staff",
  "marvel@ecomentor.green": "staff",
  "chepkemboi@ecomentor.green": "staff",
  "virginia@ecomentor.green": "staff",
};

// ✅ Define which routes require authentication
export const config = {
  matcher: ["/student/:path*", "/staff/:path*", "/admin/:path*"],
};

// 🧠 Main Middleware Logic
export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 🚫 Exclude NextAuth API & login routes from auth enforcement
    if (pathname.startsWith("/api/auth") || pathname.startsWith("/login")) {
      return NextResponse.next();
    }

    // ⚙️ Handle missing token (unauthenticated)
    if (!token) {
      // 🩵 Grace period: allow dashboard redirect immediately after login
      if (pathname.startsWith("/student/dashboard")) {
        console.warn(`⚠️ Grace period → allowing first dashboard load while token initializes`);
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.warn(`🚫 No token found → redirecting to login from ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    // 🔑 Extract user email & role
    const email = (token.email as string | undefined)?.toLowerCase();
    const tokenRoles = (token.roles as string[] | undefined) ?? ["student"];
    let role = tokenRoles[0] || "student";

    // 🧩 Apply seeded role overrides
    if (email && seededRoleOverrides[email]) {
      role = seededRoleOverrides[email];
    }

    // 🚀 Auto-redirect to correct dashboard when visiting base path
    if (["/student", "/staff", "/admin"].includes(pathname)) {
      if (role === "admin")
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "staff")
        return NextResponse.redirect(new URL("/staff/dashboard", req.url));
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // 🧱 Restrict cross-area access
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.warn(`🚫 ${email} (${role}) tried to access admin area`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/staff") && !["staff", "admin"].includes(role)) {
      console.warn(`🚫 ${email} (${role}) tried to access staff area`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/student") && !["student", "staff", "admin"].includes(role)) {
      console.warn(`🚫 ${email} (${role}) tried to access student area`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ Allow access if all checks pass
    console.log(`✅ Access granted → ${email} (${role}) → ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Let middleware logic handle the rest
    },
  }
);
