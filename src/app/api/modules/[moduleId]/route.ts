import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH: Update module
export async function PATCH(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const { moduleId } = params;
    const { title, description, content, resources } = await req.json();

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const course = await prisma.course.findUnique({ where: { id: module.courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (user.roles.includes("lecturer") && course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only update your own course modules" }, { status: 403 });
    }
    if (!user.roles.includes("lecturer") && !user.roles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: { title, description, content, resources },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove module
export async function DELETE(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    const { moduleId } = params;

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const course = await prisma.course.findUnique({ where: { id: module.courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (user.roles.includes("lecturer") && course.lecturerId !== user.id) {
      return NextResponse.json({ error: "You can only delete your own course modules" }, { status: 403 });
    }
    if (!user.roles.includes("lecturer") && !user.roles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ message: "Module deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
