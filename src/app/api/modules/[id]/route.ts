import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

//
// ✅ GET /api/modules/[id]
// Fetch one module with its lessons and parent course
//
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { title: "asc" } },
        course: { select: { id: true, title: true, slug: true } },
      },
    })

    if (!module)
      return NextResponse.json({ error: "Module not found" }, { status: 404 })

    return NextResponse.json(module, { status: 200 })
  } catch (error) {
    console.error("GET /modules/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 })
  }
}

//
// ✅ PATCH /api/modules/[id]
// Update module title or order (lecturer/admin only)
//
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
    if (!roles.includes("staff") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    const { title, order } = await req.json()

    if (!title && !order)
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      )

    const updated = await prisma.module.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(order && { order }),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("PATCH /modules/[id] error:", error)
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
  }
}

//
// ✅ DELETE /api/modules/[id]
// Deletes a module and all its lessons (lecturer/admin only)
//
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    if (!roles.includes("staff") && !roles.includes("admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params

    // 🧩 Delete lessons first (cascade manually for Mongo)
    await prisma.lesson.deleteMany({ where: { moduleId: id } })

    await prisma.module.delete({ where: { id } })

    return NextResponse.json(
      { message: "Module deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("DELETE /modules/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
