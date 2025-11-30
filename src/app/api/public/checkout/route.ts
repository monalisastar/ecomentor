import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      courseSlug,
      paymentMethod,
      amountPaid,
    } = body;

    // ============================
    //  VALIDATION
    // ============================
    if (!name || !email || !password || !courseSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ============================
    // 1️⃣ FETCH COURSE
    // ============================
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // ============================
    // 2️⃣ FIND OR CREATE USER
    // ============================
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // ✔️ New user → hash password
      const hashed = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          roles: ["student"],
          emailVerified: new Date(), // ✔️ auto-verify
          status: "ACTIVE",
        },
      });
    } else {
      // ✔️ Existing user → don't overwrite password
      //       (We allow them to continue)
    }

    // ============================
    // 3️⃣ ENROLL USER
    // ============================
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          paymentStatus: "PAID",
          paymentMethod: paymentMethod?.toUpperCase(),
          amountPaid: Number(amountPaid) || course.priceUSD || 0,
        },
      });
    }

    // ============================
    // 4️⃣ RECORD PAYMENT
    // ============================
    await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        enrollmentId: enrollment.id,
        amount: Number(amountPaid) || course.priceUSD || 0,
        method: paymentMethod?.toUpperCase(),
        status: "PAID",
      },
    });

    // ============================
    // 5️⃣ ISSUE LOGIN TOKEN (JWT)
    // ============================
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    const token = await new SignJWT({
      email: user.email,
      sub: user.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // ============================
    // 6️⃣ SET SESSION COOKIE
    // ============================
    const response = NextResponse.json({
      success: true,
      message: "Checkout complete",
      redirectTo: `/student/courses/${courseSlug}`,
    });

    response.cookies.set("next-auth.session-token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("❌ PUBLIC CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: "Checkout failed", details: String(error) },
      { status: 500 }
    );
  }
}
