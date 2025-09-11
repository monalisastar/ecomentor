import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateCourseProgress } from "@/lib/courseProgress";

// GET /api/submissions/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can view submissions" }, { status: 403 });

    const assignmentId = params.id;

    const submission = await prisma.submission.findFirst({
      where: { assignmentId, studentId: user.id },
    });

    if (!submission) return NextResponse.json({ error: "No submission found" }, { status: 404 });

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/submissions/[id]
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can submit assignments" }, { status: 403 });

    const assignmentId = params.id;
    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: "Submission content required" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    // Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: assignment.courseId },
    });
    if (!enrollment) return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });

    // Create or update submission
    const submission = await prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
      update: { content, submittedAt: new Date() },
      create: { assignmentId, studentId: user.id, content },
    });

    // Update course progress
    const progress = await updateCourseProgress(user.id, assignment.courseId);

    // Return submission and progress (RESTful, no real-time notification)
    return NextResponse.json({ submission, progress }, { status: 201 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
