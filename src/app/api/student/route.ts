import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { io } from "@/lib/socket"; // emit events

// GET all students
export async function GET() {
  const students = await prisma.student.findMany();
  return NextResponse.json(students);
}

// CREATE student
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const student = await prisma.student.create({ data: body });

    // Emit real-time event
    io.emit("student:created", student);

    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
