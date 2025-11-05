import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface Params {
  params: { lessonId: string }
}

/** 🧠 GET /api/lessons/[lessonId]/quiz */
export async function GET(req: Request, { params }: Params) {
  try {
    const { lessonId } = params
    const questions = await prisma.lessonQuiz.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(questions)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch quiz questions' }, { status: 500 })
  }
}

/** 🧩 POST /api/lessons/[lessonId]/quiz */
export async function POST(req: Request, { params }: Params) {
  try {
    const { lessonId } = params
    const body = await req.json()

    const questions = Array.isArray(body)
      ? body
      : [body] // allow single or multiple

    const created = await prisma.lessonQuiz.createMany({
      data: questions.map((q) => ({
        lessonId,
        question: q.question,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correct: q.correct,
      })),
    })

    return NextResponse.json(created)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save quiz questions' }, { status: 500 })
  }
}

/** 🗑️ DELETE /api/lessons/[lessonId]/quiz?id=questionId */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { lessonId } = params
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id)
      return NextResponse.json({ error: 'Question ID missing' }, { status: 400 })

    await prisma.lessonQuiz.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
