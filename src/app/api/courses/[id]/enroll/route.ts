import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file

import { socketServer } from "@/lib/socketServer"; // your socket server instance

// ----------------------------
// Helper to broadcast enrollment to the lecturer
// ----------------------------
async function broadcastEnrollment(enrollment: any) {
  const course = await prisma.course.findUnique({
    where: { id: enrollment.courseId },
    select: { lecturerId: true, title: true },
  });

  if (course) {
    socketServer.emit(`enrollment-${course.lecturerId}`, {
      courseId: enrollment.courseId,
      courseTitle: course.title,
      studentId: enrollment.userId,
      enrollmentId: enrollment.id,
    });
  }
}

// ====================
// POST /api/courses/[id]/enroll
// ====================
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student"))
      return NextResponse.json({ error: "Only students can enroll" }, { status: 403 });

    const courseId = params.id;

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId },
    });
    if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 400 });

    // Enroll student
    const enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });

    // Broadcast to the lecturer in realtime
    await broadcastEnrollment(enrollment);

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error enrolling:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ====================
// GET /api/courses/[id]/enroll
// ====================
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student"))
      return NextResponse.json({ error: "Only students can view enrollments" }, { status: 403 });

    const courseId = params.id;

    // Fetch enrollment info
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId },
      include: { course: true },
    });

    if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 404 });

    return NextResponse.json(enrollment, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
