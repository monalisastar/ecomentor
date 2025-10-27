import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

//
// ✅ POST /api/lessons
// Create a new lesson under a module (lecturer/admin only)
//
export async function POST(req: NextRequest) {
  try {
    // 🔑 Decode user token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 🧠 Get user roles
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { roles: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🔒 Restrict access to lecturers/admins
    const roles = user.roles || ["student"]
    if (!roles.includes("lecturer") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { moduleId, title, videoUrl, content, order } = await req.json()

    if (!moduleId || !title)
      return NextResponse.json(
        { error: "Missing required fields: moduleId or title" },
        { status: 400 }
      )

    // 🧩 Verify parent module exists
    const module = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!module)
      return NextResponse.json({ error: "Module not found" }, { status: 404 })

    // 🧩 Auto-assign lesson order if not specified
    const lessonCount = await prisma.lesson.count({ where: { moduleId } })
    const newOrder = order ?? lessonCount + 1

    // 🏗️ Create the lesson
    const newLesson = await prisma.lesson.create({
      data: {
        title,
        moduleId,
        videoUrl: videoUrl || "",
        content: content || "",
        order: newOrder,
      },
    })

    return NextResponse.json(newLesson, { status: 201 })
  } catch (error) {
    console.error("POST /lessons error:", error)
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    )
  }
}

//
// ✅ GET /api/lessons?moduleId=xyz
// Fetch all lessons for a given module
//
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get("moduleId")

    if (!moduleId)
      return NextResponse.json({ error: "Missing moduleId" }, { status: 400 })

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        content: true,
        order: true,
      },
    })

    return NextResponse.json(lessons, { status: 200 })
  } catch (error) {
    console.error("GET /lessons error:", error)
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    )
  }
}
