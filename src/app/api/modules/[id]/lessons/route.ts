import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'

// ✅ FIXED: use `context` and await params before using `id`
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { title, description, videoUrl, fileUrl, fileType, quizzes } =
      await req.json()

    // ✅ Basic validation
    if (!title?.trim() || !id?.trim())
      return NextResponse.json(
        { error: 'Title and module ID are required.' },
        { status: 400 }
      )

    if (!description?.trim())
      return NextResponse.json(
        { error: 'Lesson description is required.' },
        { status: 400 }
      )

    if (!videoUrl && !fileUrl)
      return NextResponse.json(
        {
          error:
            'At least one lesson resource (video or file) is required.',
        },
        { status: 400 }
      )

    // ✅ Enforce quizzes
    if (!Array.isArray(quizzes) || quizzes.length === 0)
      return NextResponse.json(
        { error: 'Each lesson must have at least one quiz question.' },
        { status: 400 }
      )

    // ✅ Ensure module exists
    const module = await prisma.module.findUnique({ where: { id } })
    if (!module)
      return NextResponse.json(
        { error: 'Module not found.' },
        { status: 404 }
      )

    // ✅ Generate slug
    const slug = slugify(title, { lower: true, strict: true })

    // ✅ Prevent duplicate slugs within same module
    const existingLesson = await prisma.lesson.findFirst({
      where: { slug, moduleId: id },
    })
    if (existingLesson)
      return NextResponse.json(
        {
          error:
            'A lesson with this title already exists in this module.',
        },
        { status: 409 }
      )

    // ✅ Transactional create: lesson + quizzes
    const lesson = await prisma.$transaction(async (tx) => {
      const createdLesson = await tx.lesson.create({
        data: {
          title,
          slug,
          description,
          videoUrl,
          fileUrl,
          fileType,
          module: { connect: { id } },
        },
      })

      // ✅ Create associated quizzes
      await tx.lessonQuiz.createMany({
        data: quizzes.map((q: any) => ({
          lessonId: createdLesson.id,
          question: q.question,
          optionA: q.options?.[0] || '',
          optionB: q.options?.[1] || '',
          optionC: q.options?.[2] || '',
          optionD: q.options?.[3] || '',
          correct: q.correct,
        })),
      })

      return createdLesson
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
