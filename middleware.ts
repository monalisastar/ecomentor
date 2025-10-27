import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/student/:path*", "/staff/:path*", "/admin/:path*"],
};

const specialEmails = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com",
];

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 🚫 No token → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.warn(`🚫 No token found. Redirecting to login from ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    const email = token.email as string | undefined;
    const tokenRole = token.role as string | undefined;
    const cookieRole = req.cookies.get("eco_mentor_role")?.value;
    const role = cookieRole || tokenRole || "student";

    // ✅ SPECIAL USERS (dual access)
    if (email && specialEmails.includes(email)) {
      const isStudentArea = pathname.startsWith("/student");
      const isStaffArea = pathname.startsWith("/staff");
      const isAdminArea = pathname.startsWith("/admin");

      const preferredPath =
        role === "student"
          ? "/student/dashboard"
          : role === "admin"
          ? "/admin/dashboard"
          : "/staff/dashboard";

      // 🟢 Redirect only when visiting base section paths
      const basePaths = ["/staff", "/staff/", "/student", "/student/", "/admin", "/admin/"];
      if (basePaths.includes(pathname)) {
        console.log(`🟢 Redirecting ${email} → ${preferredPath}`);
        return NextResponse.redirect(new URL(preferredPath, req.url));
      }

      // 🚀 Auto-correct if visiting wrong dashboard
      if (pathname.endsWith("/student/dashboard") && role === "staff") {
        console.log(`🔄 Auto-correcting staff from student dashboard → /staff/dashboard`);
        return NextResponse.redirect(new URL("/staff/dashboard", req.url));
      }
      if (pathname.endsWith("/staff/dashboard") && role === "student") {
        console.log(`🔄 Auto-correcting student from staff dashboard → /student/dashboard`);
        return NextResponse.redirect(new URL("/student/dashboard", req.url));
      }
      if (pathname.endsWith("/admin/dashboard") && role !== "admin") {
        console.log(`🔄 Auto-correcting non-admin from admin dashboard → ${preferredPath}`);
        return NextResponse.redirect(new URL(preferredPath, req.url));
      }

      // 🧩 Stay in correct section
      if (isStaffArea && role === "staff") return NextResponse.next();
      if (isStudentArea && role === "student") return NextResponse.next();
      if (isAdminArea && role === "admin") return NextResponse.next();

      console.log(`✅ Staying in section: ${pathname} (${role})`);
      return NextResponse.next();
    }

    // 🚫 Role-based protection for non-special users
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    if (pathname.startsWith("/student") && role !== "student") {
      console.warn(`🚫 ${email} (${role}) tried to access student area.`);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/staff") && !["staff", "admin"].includes(role)) {
      console.warn(`🚫 ${email} (${role}) tried to access staff area.`);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      console.warn(`🚫 ${email} (${role}) tried to access admin area.`);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`✅ Authorized normal user: ${email} (${role}) → ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
