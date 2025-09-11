import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Course from "@/models/Course"
import { getIO } from "@/lib/socketServer"  // helper that gives us server-side socket.io

// POST → Create new course
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const body = await req.json()

  const course = await Course.create({
    title: body.title,
    description: body.description,
    rating: 0,
    enrollments: 0,
    isNew: true,
    popular: false,
    recommended: false,
  })

  // 🔹 Broadcast new course to all students
  const io = getIO()
  io.emit("new-course", course)

  return NextResponse.json(course)
}

// PUT → Update a course
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const body = await req.json()

  const course = await Course.findByIdAndUpdate(body._id, body, { new: true })

  // 🔹 Broadcast update
  const io = getIO()
  io.emit("course-updated", course)

  return NextResponse.json(course)
}
