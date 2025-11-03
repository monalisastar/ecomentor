import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'

// ✅ POST /api/modules/[id]/lessons → Create new lesson
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { title, description, videoUrl, fileUrl, fileType } = await req.json()

    if (!title || !id) {
      return NextResponse.json(
        { error: 'Title and module ID are required.' },
        { status: 400 }
      )
    }

    // ✅ generate a slug from the title
    const slug = slugify(title, { lower: true, strict: true })

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug, // 👈 required by Prisma model
        description,
        videoUrl,
        fileUrl, // ✅ consistent with schema
        fileType,
        module: { connect: { id } },
      },
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

// ✅ GET /api/modules/[id]/lessons → Fetch all lessons under a module
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const lessons = await prisma.lesson.findMany({
      where: { moduleId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(lessons, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// ✅ DELETE /api/modules/[id]/lessons → Delete all lessons under a module
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.lesson.deleteMany({
      where: { moduleId: id },
    })

    return NextResponse.json(
      { message: 'All lessons deleted for this module.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error deleting lessons:', error)
    return NextResponse.json(
      { error: 'Failed to delete lessons' },
      { status: 500 }
    )
  }
}
