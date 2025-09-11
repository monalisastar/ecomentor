// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const specialEmails = [
  "njatabrian648@gmail.com",
  "virginia.njata@gmail.com",
  "trizer.trio56@gmail.com",
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    if (!token) return NextResponse.redirect(new URL("/login", req.url))

    const role = token.role as string | undefined
    const email = token.email as string | undefined

    // ✅ Special emails = universal access
    if (email && specialEmails.includes(email)) {
      if (pathname === "/dashboard") {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
      }
      return NextResponse.next()
    }

    // ✅ Role-based dashboard redirect
    if (pathname === "/dashboard") {
      if (role === "student") {
        return NextResponse.redirect(new URL("/student/dashboard", req.url))
      }
      if (role === "staff") {
        return NextResponse.redirect(new URL("/staff/dashboard", req.url))
      }
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/", req.url)) // fallback
    }

    // ✅ Protect role-based routes
    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/staff") && role !== "staff") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard",
    "/student/:path*",
    "/staff/:path*",
    "/admin/:path*",
  ],
}
