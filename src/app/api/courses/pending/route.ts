import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToAdmins } from "@/lib/socketServer"; // utility to broadcast to connected admins

// ====================
// GET /api/courses/pending (Admin)
// ====================
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // 2️⃣ Ensure admin role
    if (!user.roles.includes("admin")) {
      return NextResponse.json({ error: "Only admins can view pending courses" }, { status: 403 });
    }

    // 3️⃣ Find pending course approvals
    const pendingCourses = await prisma.courseApproval.findMany({
      where: { status: "pending" },
      include: {
        course: {
          include: {
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
        admin: true,
      },
    });

    // 4️⃣ Emit realtime update (so admins connected via sockets see the latest)
    await broadcastToAdmins({
      type: "pendingCoursesUpdate",
      data: pendingCourses,
    });

    return NextResponse.json(pendingCourses, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
