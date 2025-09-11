import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) {
      return NextResponse.json({ error: "Only students can make payments" }, { status: 403 });
    }

    const { courseId, amount } = await req.json();
    if (!courseId || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const payment = await prisma.payment.create({
      data: {
        studentId: user.id,
        courseId,
        amount,
        status: "pending"
      }
    });

    return NextResponse.json(payment, { status: 201 });

  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    let payments;

    if (user.roles.includes("student")) {
      // Student sees only their payments
      payments = await prisma.payment.findMany({
        where: { studentId: user.id, ...(courseId && { courseId }) },
        orderBy: { createdAt: "desc" }
      });

    } else if (user.roles.includes("lecturer")) {
      if (!courseId) return NextResponse.json({ error: "courseId query required" }, { status: 400 });
      // Lecturer sees payments for their course
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      payments = await prisma.payment.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" }
      });

    } else if (user.roles.includes("admin")) {
      payments = await prisma.payment.findMany({
        where: { ...(courseId && { courseId }) },
        orderBy: { createdAt: "desc" }
      });

    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(payments, { status: 200 });

  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
