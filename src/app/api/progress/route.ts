import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ Prisma requires Node.js runtime
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, roles: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const roles = user.roles || ["student"];

    // 🔹 ADMIN: global overview
    if (roles.includes("admin")) {
      const [totalUsers, totalEnrollments, completedEnrollments, avgProgress] =
        await Promise.all([
          prisma.user.count({
            where: { roles: { has: "student" } },
          }),
          prisma.enrollment.count(),
          prisma.enrollment.count({ where: { completed: true } }),
          prisma.enrollment.aggregate({ _avg: { progress: true } }),
        ]);

      return NextResponse.json(
        {
          role: "admin",
          summary: {
            totalUsers,
            totalEnrollments,
            completedEnrollments,
            averageProgress: Math.round(avgProgress._avg.progress || 0),
          },
        },
        { status: 200 }
      );
    }

    // 🔹 STAFF / LECTURER: course-specific overview
    if (roles.includes("staff") || roles.includes("lecturer")) {
      const [uniqueStudents, totalEnrollments, completedEnrollments, avgProgress] =
        await Promise.all([
          prisma.enrollment.groupBy({
            by: ["userId"],
            where: { course: { instructorId: user.id } },
            _count: true,
          }),
          prisma.enrollment.count({
            where: { course: { instructorId: user.id } },
          }),
          prisma.enrollment.count({
            where: { course: { instructorId: user.id }, completed: true },
          }),
          prisma.enrollment.aggregate({
            where: { course: { instructorId: user.id } },
            _avg: { progress: true },
          }),
        ]);

      const totalCertificates = await prisma.certificate.count({
        where: {
          courseSlug: {
            in: (
              await prisma.course.findMany({
                where: { instructorId: user.id },
                select: { slug: true },
              })
            ).map((c) => c.slug),
          },
        },
      });

      return NextResponse.json(
        {
          role: "staff",
          summary: {
            totalUsers: uniqueStudents.length,
            totalEnrollments,
            completedEnrollments: totalCertificates,
            averageProgress: Math.round(avgProgress._avg.progress || 0),
          },
        },
        { status: 200 }
      );
    }

    // 🔹 STUDENT: personal progress
    const [enrolledCount, completedCount, certificateCount, avgProgress] =
      await Promise.all([
        prisma.enrollment.count({ where: { userId: user.id } }),
        prisma.enrollment.count({
          where: { userId: user.id, completed: true },
        }),
        prisma.certificate.count({ where: { studentId: user.id } }),
        prisma.enrollment.aggregate({
          where: { userId: user.id },
          _avg: { progress: true },
        }),
      ]);

    return NextResponse.json(
      {
        role: "student",
        summary: {
          enrolled: enrolledCount,
          completed: completedCount,
          certificates: certificateCount,
          averageProgress: Math.round(avgProgress._avg.progress || 0),
        },
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
