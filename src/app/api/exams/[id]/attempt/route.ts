import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/exams/[id]/attempt
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can attempt exams" }, { status: 403 });

    const examId = params.id;
    const { answers } = await req.json(); // array of { questionId, answer }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Fetch exam and questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    // Calculate score
    let score = 0;
    for (const q of exam.questions) {
      const submitted = answers.find(a => a.questionId === q.id);
      if (submitted && submitted.answer === q.answer) score += 1;
    }

    const total = exam.questions.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    // Save attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId: user.id,
        score: percentage
      }
    });

    return NextResponse.json({ attempt, totalQuestions: total, correct: score, scorePercentage: percentage }, { status: 201 });

  } catch (error) {
    console.error("Error attempting exam:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
