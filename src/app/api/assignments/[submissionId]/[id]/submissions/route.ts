import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/assignments/[id]/submissions
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const assignmentId = params.id;

    // Fetch assignment
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    // Ensure lecturer owns the course
    if (!user.roles.includes("lecturer") || assignment.courseId && assignment.courseId !== user.id) {
      // Actually, need to fetch course to check lecturer
      const course = await prisma.course.findUnique({ where: { id: assignment.courseId } });
      if (!course || course.lecturerId !== user.id) {
        return NextResponse.json({ error: "You can only view submissions for your own course" }, { status: 403 });
      }
    }

    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { submittedAt: "desc" }
    });

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
