import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 🧠 GET /api/lessons/[id]/quiz
 * Fetches all quiz questions for a specific lesson.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ awaitable params
) {
  try {
    const { id } = await context.params // ✅ required in Next.js 15

    const questions = await prisma.lessonQuiz.findMany({
      where: { lessonId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        question: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correct: true,
      },
    })

    return NextResponse.json(questions)
  } catch (err) {
    console.error('❌ [GET /lessons/:id/quiz] Failed to fetch quiz questions:', err)
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    )
  }
}

/**
 * 🧩 POST /api/lessons/[id]/quiz
 * Saves one or more quiz questions for a lesson.
 * Accepts JSON body: either a single object or array of questions.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const questions = Array.isArray(body) ? body : [body]

    if (!questions.length) {
      return NextResponse.json({ error: 'No quiz data provided' }, { status: 400 })
    }

    const created = await prisma.lessonQuiz.createMany({
      data: questions.map((q) => ({
        lessonId: id,
        question: q.question,
        optionA: q.options?.[0] || '',
        optionB: q.options?.[1] || '',
        optionC: q.options?.[2] || '',
        optionD: q.options?.[3] || '',
        correct: q.correct || '',
      })),
    })

    return NextResponse.json({
      message: `✅ ${created.count} quiz question(s) saved successfully.`,
      count: created.count,
    })
  } catch (err) {
    console.error('❌ [POST /lessons/:id/quiz] Failed to save quiz questions:', err)
    return NextResponse.json(
      { error: 'Failed to save quiz questions' },
      { status: 500 }
    )
  }
}

/**
 * 🗑️ DELETE /api/lessons/[id]/quiz?id=questionId
 * Deletes a single quiz question by ID.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await context.params // not used but awaited for consistency
    const { searchParams } = new URL(req.url)
    const qid = searchParams.get('id')

    if (!qid) {
      return NextResponse.json({ error: 'Question ID missing' }, { status: 400 })
    }

    await prisma.lessonQuiz.delete({ where: { id: qid } })

    return NextResponse.json({ message: '✅ Question deleted successfully.' })
  } catch (err) {
    console.error('❌ [DELETE /lessons/:id/quiz] Failed to delete question:', err)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
