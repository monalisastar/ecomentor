import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToStorage } from "@/lib/storage";

// POST: Upload a resource
export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "document";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const url = await uploadFileToStorage(file);

    const resource = await prisma.moduleResource.create({
      data: { moduleId, type, title: file.name, url },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET: List all resources for a module
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const { moduleId } = params;

    const resources = await prisma.moduleResource.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(resources, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
