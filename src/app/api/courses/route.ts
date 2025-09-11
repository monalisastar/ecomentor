import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"

import { socketServer } from "@/lib/socketServer"; // your socket server instance

// ----------------------------
// Helper to broadcast new course to connected admins
// ----------------------------
async function broadcastNewCourse(course: any) {
  socketServer.emit("new-course-admins", {
    courseId: course.id,
    title: course.title,
    lecturerId: course.lecturerId,
    createdAt: course.createdAt,
  });
}

// ====================
// POST /api/courses (Lecturer/Admin creates a course)
// ====================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("lecturer") && !user.roles.includes("admin"))
      return NextResponse.json({ error: "Only lecturers or admins can create courses" }, { status: 403 });

    const body = await req.json();
    const { title, description, category, level, duration, shortDescription, fullDescription, tags } = body;

    if (!title || !description) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        duration,
        shortDescription,
        fullDescription,
        tags,
        lecturerId: user.roles.includes("lecturer") ? user.id : null, // admin-created course may have null lecturer
      },
    });

    // Broadcast new course to admins
    await broadcastNewCourse(course);

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ====================
// GET /api/courses (Student views approved courses)
// ====================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student"))
      return NextResponse.json({ error: "Only students can view approved courses" }, { status: 403 });

    const courses = await prisma.course.findMany({
      where: { approvals: { some: { status: "approved" } } },
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
        approvals: { select: { status: true, reviewedAt: true } },
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching approved courses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
