// src/app/api/staff/courses/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { io } from "@/lib/socket" // emits real-time events

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || !user.roles.includes("lecturer")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, category, level, modules, duration } = body

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        duration,
        lecturerId: user.id,
        modules: {
          create: modules.map((m: any, i: number) => ({
            title: m.title,
            content: m.content,
            order: i,
          })),
        },
        approvals: {
          create: {
            adminId: "", // will be set when admin reviews
            status: "pending",
          },
        },
      },
      include: {
        modules: true,
        approvals: true,
      },
    })

    // 🔔 Broadcast to WebSocket (staff dashboards, admin dashboards)
    io.emit("course:new", course)

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
