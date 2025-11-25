import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

const MAX_ATTEMPTS = 3
const COOLDOWN_HOURS = 8

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: lessonId } = params

  // ✅ Authenticate user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub

  try {
    const { answers } = await req.json()

    // 🧩 Fetch quiz questions
    const questions = await prisma.lessonQuiz.findMany({
      where: { lessonId },
      include: { lesson: { include: { module: true } } },
    })

    if (!questions.length) {
      return NextResponse.json(
        { error: 'No quiz found for this lesson.' },
        { status: 404 }
      )
    }

    const courseId = questions[0].lesson.module.courseId

    // 🕒 Check previous attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId, lessonId },
      orderBy: { createdAt: 'desc' },
      take: MAX_ATTEMPTS,
    })

    const lastAttempt = recentAttempts[0]
    const attemptCount = recentAttempts.length

    // 🚫 Check if user is locked out
    if (lastAttempt?.lockedUntil && new Date() < new Date(lastAttempt.lockedUntil)) {
      const unlockTime = new Date(lastAttempt.lockedUntil).toLocaleString()
      return NextResponse.json(
        { error: `You have reached the maximum number of attempts. You can retry after ${unlockTime}.` },
        { status: 429 }
      )
    }

    // 🚫 If user already has 3 attempts and hasn’t passed any
    if (
      attemptCount >= MAX_ATTEMPTS &&
      !recentAttempts.some((a) => a.isPassed)
    ) {
      const lockedUntil = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000)
      await prisma.quizAttempt.update({
        where: { id: lastAttempt.id },
        data: { lockedUntil },
      })

      return NextResponse.json(
        {
          error: `Maximum of ${MAX_ATTEMPTS} attempts reached. Please try again after ${COOLDOWN_HOURS} hours.`,
        },
        { status: 429 }
      )
    }

    // ✅ Calculate score
    let correctCount = 0
    for (const q of questions) {
      if (answers[q.id] && answers[q.id] === q.correct) correctCount++
    }

    const total = questions.length
    const score = Math.round((correctCount / total) * 100)
    const isPassed = score >= 70

    // 🧾 Record this attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        lessonId,
        courseId,
        score,
        isPassed,
        attemptNo: attemptCount + 1,
      },
    })

    // ✅ Update progress record
    await prisma.progressRecord.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completedAt: new Date(),
        score,
        isPassed,
      },
      create: {
        userId,
        courseId,
        lessonId,
        completedAt: new Date(),
        score,
        isPassed,
      },
    })

    // 🪶 Update course progress if passed
    if (isPassed) {
      const totalLessons = await prisma.lesson.count({
        where: { module: { courseId } },
      })
      const completedLessons = await prisma.progressRecord.count({
        where: { userId, courseId, isPassed: true },
      })
      const progress = Math.min(
        Math.round((completedLessons / totalLessons) * 100),
        100
      )

      await prisma.enrollment.updateMany({
        where: { userId, courseId },
        data: { progress, completed: progress === 100 },
      })
    }

    return NextResponse.json({ score, isPassed })
  } catch (err) {
    console.error('❌ Quiz submission failed:', err)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
