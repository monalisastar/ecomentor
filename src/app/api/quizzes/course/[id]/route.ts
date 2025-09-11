import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/quizzes/course/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const courseId = params.id;

    // Fetch quizzes
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      include: { questions: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
