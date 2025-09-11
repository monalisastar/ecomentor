import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO, initIO } from "@/lib/socketServer";


export async function GET(_: Request, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const student = await prisma.student.update({
      where: { id: params.id },
      data: body,
    });

    // Emit real-time event
    io.emit("student:updated", student);

    return NextResponse.json(student);
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.student.delete({ where: { id: params.id } });

    // Emit real-time event
    io.emit("student:deleted", params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
