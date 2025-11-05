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

export const config = {
  matcher: ["/student/:path*", "/staff/:path*", "/admin/:path*"],
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 🚫 No session token → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.warn(`🚫 No token found. Redirecting to login from ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    const email = (token.email as string | undefined)?.toLowerCase();
    const tokenRoles = (token.roles as string[] | undefined) ?? ["student"];
    let role = tokenRoles[0] || "student";

    // 🧩 Force seeded roles to override anything else
    if (email && seededRoleOverrides[email]) {
      role = seededRoleOverrides[email];
    }

    // 🚀 Auto-dashboard redirect if someone visits base paths
    if (["/student", "/staff", "/admin"].includes(pathname)) {
      if (role === "admin")
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "staff")
        return NextResponse.redirect(new URL("/staff/dashboard", req.url));
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // 🛡 Force admins to admin dashboard (even if they try /student)
    if (role === "admin" && pathname.startsWith("/student")) {
      console.warn(`⚠️ Admin ${email} attempted to access student area → redirecting to /admin/dashboard`);
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (role === "admin" && pathname.startsWith("/staff")) {
      console.warn(`⚠️ Admin ${email} attempted to access staff area → redirecting to /admin/dashboard`);
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // 🚫 Access restrictions
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.warn(`🚫 ${email} (${role}) tried to access admin area.`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/staff") && !["staff", "admin"].includes(role)) {
      console.warn(`🚫 ${email} (${role}) tried to access staff area.`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/student") && !["student", "staff", "admin"].includes(role)) {
      console.warn(`🚫 ${email} (${role}) tried to access student area.`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log(`✅ Access granted: ${email} (${role}) → ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
