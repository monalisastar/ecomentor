import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions" // ✅ matches your file


// --- Helper to broadcast course approval update ---
async function broadcastCourseApproval(courseId: string, status: string) {
  // Replace with your WebSocket/SSE logic
  console.log(`Broadcasting course ${courseId} status: ${status} to lecturer`);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // ✅ ensure admin
    if (!user.roles.includes("admin")) {
      return NextResponse.json({ error: "Only admins can approve/reject courses" }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json(); // expected: "approved" | "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // ✅ check course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: { approvals: true, lecturer: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // ✅ update approval record
    const approval = await prisma.courseApproval.updateMany({
      where: {
        courseId: id,
        status: "pending"
      },
      data: {
        status,
        reviewedAt: new Date(),
        adminId: user.id
      }
    });

    if (approval.count === 0) {
      return NextResponse.json({ error: "No pending approval found" }, { status: 400 });
    }

    // ✅ Broadcast approval update to lecturer
    await broadcastCourseApproval(id, status);

    return NextResponse.json({ message: `Course ${status} successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error approving course:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
