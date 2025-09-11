import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/assignments/[submissionId]/grade
export async function PATCH(req: NextRequest, { params }: { params: { submissionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("lecturer")) return NextResponse.json({ error: "Only lecturers can grade submissions" }, { status: 403 });

    const submissionId = params.submissionId;
    const body = await req.json();
    const { grade } = body;

    if (grade === undefined || grade < 0) return NextResponse.json({ error: "Invalid grade" }, { status: 400 });

    // Fetch submission and assignment
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true }
    });

    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    // Check lecturer owns the course
    const course = await prisma.course.findUnique({ where: { id: submission.assignment.courseId } });
    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only grade submissions for your own course" }, { status: 403 });
    }

    // Update grade
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: { grade }
    });

    // Return updated submission (RESTful, no real-time notification)
    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
