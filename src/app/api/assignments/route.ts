import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"

// POST /api/assignments
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;

    // Ensure lecturer role
    if (!user.roles.includes("lecturer")) {
      return NextResponse.json({ error: "Only lecturers can create assignments" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, dueDate, courseId } = body;

    if (!title || !description || !dueDate || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure lecturer owns the course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only add assignments to your own courses" }, { status: 403 });
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: { title, description, dueDate: new Date(dueDate), courseId },
    });

    // Return assignment (RESTful, no real-time broadcasting)
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
