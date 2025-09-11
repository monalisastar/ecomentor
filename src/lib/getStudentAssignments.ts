// /lib/getStudentAssignments.ts
import prisma from "@/lib/prisma";

export async function getStudentAssignments(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          assignments: {
            include: {
              submissions: {
                where: { studentId },
              },
            },
          },
        },
      },
    },
  });

  // Flatten assignments across enrolled courses
  return enrollments.flatMap((enroll) =>
    enroll.course.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      courseTitle: enroll.course.title,
      submission: a.submissions[0] || null,
    }))
  );
}
