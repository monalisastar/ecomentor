import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

//
// ✅ GET /api/lessons/[id]
// Fetch a single lesson with its parent module & course
//
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    return NextResponse.json(lesson, { status: 200 })
  } catch (error) {
    console.error("GET /lessons/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    )
  }
}

//
// ✅ PATCH /api/lessons/[id]
// Update lesson details (Lecturer/Admin only)
// Supports text, video, and file uploads
//
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔑 Auth check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const roles = user.roles || ["student"]
    if (!roles.includes("lecturer") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    const {
      title,
      description,
      order,
      contentType,
      textContent,
      fileUrl,
      fileType,
      videoUrl,
      duration,
    } = await req.json()

    // 🧩 Ensure at least one editable field exists
    if (
      !title &&
      !description &&
      !order &&
      !contentType &&
      !textContent &&
      !fileUrl &&
      !fileType &&
      !videoUrl &&
      !duration
    ) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      )
    }

    // 🏗️ Update lesson
    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(order && { order }),
        ...(duration && { duration }),
        ...(contentType && { contentType }),
        ...(textContent !== undefined && { textContent }),
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
        ...(videoUrl && { videoUrl }),
      },
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
        videoUrl: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("PATCH /lessons/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    )
  }
}

//
// ✅ DELETE /api/lessons/[id]
// Remove a lesson (Lecturer/Admin only)
//
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const roles = user.roles || ["student"]
    if (!roles.includes("lecturer") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    const existing = await prisma.lesson.findUnique({ where: { id } })

    if (!existing)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    await prisma.lesson.delete({ where: { id } })

    return NextResponse.json(
      { message: "Lesson deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("DELETE /lessons/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    )
  }
}
