import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/quizzes/[id]/attempt
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can attempt quizzes" }, { status: 403 });

    const quizId = params.id;
    const { answers } = await req.json(); // array of { questionId, answer }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Fetch quiz and questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Calculate score
    let score = 0;
    for (const q of quiz.questions) {
      const submitted = answers.find(a => a.questionId === q.id);
      if (submitted && submitted.answer === q.answer) score += 1;
    }

    // Optional: normalize score to 100
    const total = quiz.questions.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.id,
        score: percentage
      }
    });

    return NextResponse.json({ attempt, totalQuestions: total, correct: score, scorePercentage: percentage }, { status: 201 });

  } catch (error) {
    console.error("Error attempting quiz:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
