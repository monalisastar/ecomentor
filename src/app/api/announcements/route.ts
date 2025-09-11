import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;

    // ✅ Lecturers or Admins can create
    if (!user.roles.includes("lecturer") && !user.roles.includes("admin")) {
      return NextResponse.json({ error: "Only lecturers or admins can create announcements" }, { status: 403 });
    }

    const { title, message, courseId } = await req.json();
    if (!title || !message || !courseId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ If lecturer, verify ownership of course
    if (user.roles.includes("lecturer")) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        courseId,
        authorId: user.id,
      }
    });

    return NextResponse.json(announcement, { status: 201 });

  } catch (error) {
    console.error("Error creating announcement:", error);
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

    if (!courseId) return NextResponse.json({ error: "courseId query required" }, { status: 400 });

    let announcements;

    if (user.roles.includes("student")) {
      const enrollment = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId } });
      if (!enrollment) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      announcements = await prisma.announcement.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" }
      });

    } else if (user.roles.includes("lecturer")) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      announcements = await prisma.announcement.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" }
      });

    } else if (user.roles.includes("admin")) {
      announcements = await prisma.announcement.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" }
      });

    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(announcements, { status: 200 });

  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
