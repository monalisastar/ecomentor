import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/exams/[id]/results
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const examId = params.id;

    // Fetch exam with course info
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: true }
    });
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    let attempts;

    if (user.roles.includes("student")) {
      // Student sees only their attempts
      attempts = await prisma.examAttempt.findMany({
        where: { examId, studentId: user.id },
      });
    } else if (user.roles.includes("lecturer")) {
      // Lecturer sees attempts for exams in their course
      if (exam.course.lecturerId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      attempts = await prisma.examAttempt.findMany({
        where: { examId },
        include: { student: { select: { id: true, name: true, email: true } } },
      });
    } else if (user.roles.includes("admin")) {
      // Admin sees all attempts
      attempts = await prisma.examAttempt.findMany({
        where: { examId },
        include: { student: { select: { id: true, name: true, email: true } } },
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ exam, attempts }, { status: 200 });

  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
