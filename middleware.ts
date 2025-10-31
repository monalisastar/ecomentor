import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Run middleware for all pages EXCEPT login/auth/static
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|forgot-password|unauthorized|api/health).*)",
  ],
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 🧩 Skip middleware for login/register/etc.
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/unauthorized")
    ) {
      return NextResponse.next();
    }

    // 🚫 No token → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.warn(`🚫 No token found → redirecting from ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Extract roles safely (handle array or single value)
    const email = token.email as string | undefined;
    const userRoles = Array.isArray(token.roles)
      ? token.roles
      : token.role
      ? [token.role]
      : ["student"];

    console.log("🎫 Middleware check →", { email, roles: userRoles, pathname });

    // ✅ Role-based access (multi-role aware)
    if (pathname.startsWith("/student")) {
      if (!userRoles.includes("student") && !userRoles.includes("admin")) {
        console.warn(`🚫 Unauthorized roles '${userRoles}' for student route`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (pathname.startsWith("/staff")) {
      if (!userRoles.includes("staff") && !userRoles.includes("admin")) {
        console.warn(`🚫 Unauthorized roles '${userRoles}' for staff route`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (pathname.startsWith("/admin")) {
      if (!userRoles.includes("admin")) {
        console.warn(`🚫 Unauthorized roles '${userRoles}' for admin route`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    console.log(`✅ Authorized: ${email} (${userRoles.join(", ")}) → ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ✅ must have valid session
    },
  }
);
