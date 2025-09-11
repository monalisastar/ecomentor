import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file


// POST: Create module
export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const { courseId } = params;

    if (!user.roles.includes("lecturer") && !user.roles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, content, resources } = await req.json();
    if (!title || !description) return NextResponse.json({ error: "Title and description required" }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (user.roles.includes("lecturer") && course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only add modules to your own courses" }, { status: 403 });
    }

    const module = await prisma.module.create({
      data: { courseId, title, description, content, resources: resources || [] },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET: Fetch modules for course
export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params;

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(modules, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
