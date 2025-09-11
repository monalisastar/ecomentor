import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can update progress" }, { status: 403 });

    const courseId = params.id;
    const body = await req.json();
    const { progress } = body;

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "Invalid progress value" }, { status: 400 });
    }

    // Find enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId },
    });
    if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

    // Update progress and possibly status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        status: progress === 100 ? "completed" : "in_progress",
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    return NextResponse.json(updatedEnrollment, { status: 200 });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
