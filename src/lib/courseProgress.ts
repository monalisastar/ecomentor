// src/lib/courseProgress.ts
import prisma from "./prisma";

export async function updateCourseProgress(userId: string, courseId: string) {
  // 1️⃣ Total items in the course
  const totalModules = await prisma.module.count({ where: { courseId } });
  const totalAssignments = await prisma.assignment.count({ where: { courseId } });
  const totalQuizzes = await prisma.quiz.count({ where: { courseId } });
  const totalExams = await prisma.exam.count({ where: { courseId } });

  const totalItems = totalModules + totalAssignments + totalQuizzes + totalExams;
  if (totalItems === 0) return; // avoid division by zero

  // 2️⃣ Completed items
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId },
  });
  if (!enrollment) throw new Error("Enrollment not found");

  const completedModules = await prisma.moduleCompletion.count({ where: { enrollmentId: enrollment.id } });
  const completedAssignments = await prisma.submission.count({ where: { studentId: userId, assignment: { courseId } } });
  const completedQuizzes = await prisma.quizAttempt.count({ where: { studentId: userId, quiz: { courseId } } });
  const completedExams = await prisma.examAttempt.count({ where: { studentId: userId, exam: { courseId } } });

  const completedItems = completedModules + completedAssignments + completedQuizzes + completedExams;

  // 3️⃣ Calculate progress %
  const progress = Math.round((completedItems / totalItems) * 100);

  // 4️⃣ Update enrollment
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress,
      status: progress === 100 ? "completed" : "in_progress",
      completedAt: progress === 100 ? new Date() : null,
    },
  });
}
