import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next"; // ✅ must come from next-auth/next
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.warn("❌ Unauthorized: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roles = user.roles || ["student"];

    // 🧩 ADMIN / LECTURER
    if (roles.includes("admin") || roles.includes("lecturer")) {
      const [totalUsers, totalEnrollments, completedEnrollments, avgProgress] =
        await Promise.all([
          prisma.user.count(),
          prisma.enrollment.count(),
          prisma.enrollment.count({ where: { completed: true } }),
          prisma.enrollment.aggregate({ _avg: { progress: true } }),
        ]);

      const topStudents = await prisma.enrollment.findMany({
        where: { completed: true },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true, slug: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });

      return NextResponse.json(
        {
          role: roles[0],
          summary: {
            totalUsers,
            totalEnrollments,
            completedEnrollments,
            averageProgress: Math.round(avgProgress._avg.progress || 0),
          },
          topStudents,
        },
        { status: 200 }
      );
    }

    // 🧩 STUDENT
    const [enrolledCount, completedCount, certificateCount, avgProgress] =
      await Promise.all([
        prisma.enrollment.count({ where: { userId: user.id } }),
        prisma.enrollment.count({ where: { userId: user.id, completed: true } }),
        prisma.certificate.count({ where: { studentId: user.id } }),
        prisma.enrollment.aggregate({
          where: { userId: user.id },
          _avg: { progress: true },
        }),
      ]);

    const recentCourses = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: { select: { title: true, slug: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });

    return NextResponse.json(
      {
        role: "student",
        summary: {
          enrolled: enrolledCount,
          completed: completedCount,
          certificates: certificateCount,
          averageProgress: Math.round(avgProgress._avg.progress || 0),
        },
        recentCourses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /progress/overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress overview" },
      { status: 500 }
    );
  }
}
