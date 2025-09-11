import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/quizzes
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("lecturer")) return NextResponse.json({ error: "Only lecturers can create quizzes" }, { status: 403 });

    const body = await req.json();
    const { title, courseId, questions } = body;

    if (!title || !courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure lecturer owns the course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only create quizzes for your own course" }, { status: 403 });
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        title,
        courseId,
        questions: {
          create: questions.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.answer
          }))
        }
      },
      include: { questions: true }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
