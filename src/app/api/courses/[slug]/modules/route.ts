import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'

/**
 * 📘 POST /api/courses/[slug]/modules
 * ---------------------------------------------------------
 * Create a new module under a specific course.
 * Requires the course's slug as a URL param.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const { title, description, objectives } = body // ✅ include objectives

    if (!title) {
      return NextResponse.json(
        { error: 'Module title is required.' },
        { status: 400 }
      )
    }

    // 🔍 Find the course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      )
    }

    // 🧩 Generate a slug for the new module
    const moduleSlug = slugify(title, { lower: true, strict: true })

    // 🧩 Create the new module (with objectives)
    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        objectives, // ✅ save objectives field
        slug: moduleSlug,
        courseId: course.id,
      },
    })

    return NextResponse.json(newModule, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module.' },
      { status: 500 }
    )
  }
}

/**
 * 📗 GET /api/courses/[slug]/modules
 * ---------------------------------------------------------
 * Get all modules belonging to a specific course.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // 🔍 Find the course first
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      )
    }

    // 📦 Fetch all modules for that course
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: 'asc' },
      include: {
        lessons: true,
      },
    })

    return NextResponse.json(modules, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules.' },
      { status: 500 }
    )
  }
}
