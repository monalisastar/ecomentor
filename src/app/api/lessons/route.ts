import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";

/**
 * ✍️ POST /api/lessons
 * ---------------------------------------------------------
 * Create a new lesson under a module.
 * Allowed roles: staff, lecturer, admin
 * Supports text, video, or uploaded files (PDF, DOCX, PPTX, ZIP, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    // 🔑 1️⃣ Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 🧠 2️⃣ Check user roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const allowedRoles = ["staff", "lecturer", "admin"];
    const isAuthorized = user.roles.some((r) => allowedRoles.includes(r));
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 📦 3️⃣ Parse request body
    const {
      moduleId,
      title,
      description,
      contentType,
      textContent,
      fileUrl,
      fileType,
      fileName,
      fileSize,
      fileUploaded,
      videoUrl,
      videoName,
      videoSize,
      videoUploaded,
      order,
    } = await req.json();

    if (!moduleId || !title)
      return NextResponse.json(
        { error: "Missing required fields: moduleId or title" },
        { status: 400 }
      );

    // 🧩 4️⃣ Verify module exists
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module)
      return NextResponse.json({ error: "Module not found" }, { status: 404 });

    // 🔢 5️⃣ Determine lesson order
    const lessonCount = await prisma.lesson.count({ where: { moduleId } });
    const newOrder = order ?? lessonCount + 1;

    // 🏗️ 6️⃣ Create the lesson
    const newLesson = await prisma.lesson.create({
      data: {
        title,
        slug: nanoid(10),
        description: description || null,
        moduleId,
        order: newOrder,
        contentType: contentType || "text",
        textContent: textContent || null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileUploaded: fileUploaded || null,
        videoUrl: videoUrl || null,
        videoName: videoName || null,
        videoSize: videoSize || null,
        videoUploaded: videoUploaded || null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        contentType: true,
        textContent: true,
        fileUrl: true,
        fileType: true,
        fileName: true,
        fileSize: true,
        fileUploaded: true,
        videoUrl: true,
        videoName: true,
        videoSize: true,
        videoUploaded: true,
        moduleId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST /lessons error:", error);
    return NextResponse.json(
      { error: "Failed to create lesson", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 📘 GET /api/lessons?moduleId=xyz | /api/lessons?courseId=xyz
 * ---------------------------------------------------------
 * Fetch lessons under a module or course.
 * Publicly accessible (for student dashboard view).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const courseId = searchParams.get("courseId");

    if (!moduleId && !courseId)
      return NextResponse.json(
        { error: "Missing moduleId or courseId" },
        { status: 400 }
      );

    const lessons = await prisma.lesson.findMany({
      where: moduleId
        ? { moduleId }
        : { module: { courseId: courseId || undefined } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        duration: true,
        contentType: true,
        textContent: true,
        fileUrl: true,
        fileType: true,
        fileName: true,
        fileSize: true,
        fileUploaded: true,
        videoUrl: true,
        videoName: true,
        videoSize: true,
        videoUploaded: true,
        createdAt: true,
        updatedAt: true,
        module: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, slug: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json(lessons, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /lessons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons", details: error.message },
      { status: 500 }
    );
  }
}
