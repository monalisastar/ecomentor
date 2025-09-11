// /app/api/user/set-role/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Missing email or role" }, { status: 400 });
    }

    // ✅ Update role in DB
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
    });

    return NextResponse.json({ success: true, role: updatedUser.role });
  } catch (err: any) {
    console.error("Set role error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
