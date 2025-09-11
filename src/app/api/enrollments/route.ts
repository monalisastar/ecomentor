import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("student")) return NextResponse.json({ error: "Only students can view enrollments" }, { status: 403 });

    // Fetch all enrollments for this student
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(enrollments, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
