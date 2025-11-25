import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

/**
 * 📘 GET /api/lessons/[id]
 * ---------------------------------------------------------
 * Fetch a single lesson with its parent module & course.
 * Public endpoint (for viewing).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    })

    if (!lesson)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    // 🧩 Backward compatibility — populate metadata placeholders if missing
    const safeLesson = {
      ...lesson,
      videoName: lesson.videoName || "N/A",
      videoSize: lesson.videoSize || "Unknown",
      videoUploaded: lesson.videoUploaded || "Not recorded",
      fileName: lesson.fileName || "N/A",
      fileSize: lesson.fileSize || "Unknown",
      fileUploaded: lesson.fileUploaded || "Not recorded",
    }

    return NextResponse.json(safeLesson, { status: 200 })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    console.error("❌ GET /lessons/[id] error:", message)
    return NextResponse.json(
      { error: "Failed to fetch lesson", details: message },
      { status: 500 }
    )
  }
}

/**
 * ✏️ PATCH /api/lessons/[id]
 * ---------------------------------------------------------
 * Update lesson details and metadata (staff/lecturer/admin only).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true, name: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user.roles.some((r) => allowedRoles.includes(r))
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await context.params
    const body = await req.json()

    const {
      title,
      description,
      order,
      duration,
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
    } = body

    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(order !== undefined && { order }),
      ...(duration && { duration }),
      ...(contentType && { contentType }),
      ...(textContent !== undefined && { textContent }),
      ...(fileUrl && { fileUrl }),
      ...(fileType && { fileType }),
      ...(fileName && { fileName }),
      ...(fileSize && { fileSize }),
      ...(fileUploaded && { fileUploaded }),
      ...(videoUrl && { videoUrl }),
      ...(videoName && { videoName }),
      ...(videoSize && { videoSize }),
      ...(videoUploaded && { videoUploaded }),
      updatedBy: user.name || token.email,
    }

    // 🧠 Ensure not empty
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No editable fields provided for update" },
        { status: 400 }
      )
    }

    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    // 🩹 If old lessons have videoUrl but missing metadata, preserve it
    if (existing.videoUrl && !existing.videoName && !updateData.videoName) {
      updateData.videoName = "Legacy Upload"
      updateData.videoSize = "Unknown"
      updateData.videoUploaded = new Date().toLocaleString()
    }

    if (existing.fileUrl && !existing.fileName && !updateData.fileName) {
      updateData.fileName = "Legacy Document"
      updateData.fileSize = "Unknown"
      updateData.fileUploaded = new Date().toLocaleString()
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
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
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedLesson, { status: 200 })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    console.error("❌ PATCH /lessons/[id] error:", message)
    return NextResponse.json(
      { error: "Failed to update lesson", details: message },
      { status: 500 }
    )
  }
}

/**
 * 🗑 DELETE /api/lessons/[id]
 * ---------------------------------------------------------
 * Deletes a lesson (staff/lecturer/admin only).
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const allowedRoles = ["staff", "lecturer", "admin"]
    const isAuthorized = user.roles.some((r) => allowedRoles.includes(r))
    if (!isAuthorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await context.params
    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    await prisma.lesson.delete({ where: { id } })

    return NextResponse.json(
      { message: "Lesson deleted successfully" },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    console.error("❌ DELETE /lessons/[id] error:", message)
    return NextResponse.json(
      { error: "Failed to delete lesson", details: message },
      { status: 500 }
    )
  }
}
