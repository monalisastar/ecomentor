import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateCourseProgress } from "@/lib/courseProgress";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can view modules" }, { status: 403 });

    const moduleId = params.id;

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    return NextResponse.json(module, { status: 200 });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can complete modules" }, { status: 403 });

    const moduleId = params.id;

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: module.courseId },
    });
    if (!enrollment) return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });

    // Create a "module completion record" (optional table) or simply track progress in enrollment
    // For simplicity, we can just call updateCourseProgress
    const progress = await updateCourseProgress(user.id, module.courseId);

    return NextResponse.json({ message: "Module marked completed", progress }, { status: 200 });
  } catch (error) {
    console.error("Error completing module:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
