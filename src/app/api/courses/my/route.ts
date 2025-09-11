import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file


export async function GET(req: NextRequest) {
  try {
    // ✅ 1. Get session user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // ✅ 2. Check lecturer role
    if (!user.roles.includes("lecturer")) {
      return NextResponse.json({ error: "Only lecturers can view their courses" }, { status: 403 });
    }

    // ✅ 3. Get lecturer’s courses
    const courses = await prisma.course.findMany({
      where: { lecturerId: user.id },
      include: {
        modules: true,
        enrollments: true,
        announcements: true,
        assignments: true,
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching lecturer courses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
