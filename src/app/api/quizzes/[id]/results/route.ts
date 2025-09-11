import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/quizzes/[id]/results
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const quizId = params.id;

    // Fetch quiz to check ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Student: only their attempts
    if (user.roles.includes("student")) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId, studentId: user.id },
        orderBy: { attemptedAt: 'desc' }
      });
      return NextResponse.json({ attempts }, { status: 200 });
    }

    // Lecturer: only if they own the course
    if (user.roles.includes("lecturer")) {
      if (quiz.course.lecturerId !== user.id) {
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { attemptedAt: 'desc' }
      });

      return NextResponse.json({ attempts }, { status: 200 });
    }

    // Admin: optional full access
    if (user.roles.includes("admin")) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { attemptedAt: 'desc' }
      });
      return NextResponse.json({ attempts }, { status: 200 });
    }

    return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
