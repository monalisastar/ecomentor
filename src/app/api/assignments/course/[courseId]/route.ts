import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/assignments/course/[courseId]
export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const { courseId } = params;

    // Fetch course to check access
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // Students must be enrolled
    if (user.roles.includes("student")) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId },
      });
      if (!enrollment) return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Lecturers must own the course
    if (user.roles.includes("lecturer") && course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only view assignments for your own course" }, { status: 403 });
    }

    // Fetch assignments
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: "asc" },
    });

    // Return assignments (RESTful, no real-time broadcasting)
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
