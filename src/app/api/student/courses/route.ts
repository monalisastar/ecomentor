// src/app/api/student/courses/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getIO } from "@/app/api/socket/route"

// Fetch courses
export async function GET() {
  const courses = await prisma.course.findMany({
    include: { lecturer: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(courses)
}

// Create new course (lecturer/admin action)
export async function POST(req: Request) {
  const body = await req.json()

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      lecturerId: body.lecturerId,
    },
  })

  // Emit event to all connected clients
  const io = getIO()
  io.emit("course:new", course)

  return NextResponse.json(course)
}

// Update course
export async function PUT(req: Request) {
  const body = await req.json()

  const course = await prisma.course.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
    },
  })

  // Emit update event
  const io = getIO()
  io.emit("course:update", course)

  return NextResponse.json(course)
}
