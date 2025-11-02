import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// ✅ Update course image (called after upload)
export async function PATCH(
  req: Request,
  { params }: { params: { courseSlug: string } }
) {
  try {
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    const course = await prisma.course.update({
      where: { slug: params.courseSlug },
      data: { image },
    })

    return NextResponse.json({
      success: true,
      message: "Course image updated successfully.",
      course,
    })
  } catch (error: any) {
    console.error("❌ Image update error:", error)
    return NextResponse.json(
      { error: "Failed to update course image", details: error.message },
      { status: 500 }
    )
  }
}

// ✅ Get current image (used for preloading on page load)
export async function GET(
  req: Request,
  { params }: { params: { courseSlug: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: params.courseSlug },
      select: { image: true },
    })

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })

    return NextResponse.json({ image: course.image })
  } catch (error: any) {
    console.error("❌ Fetch image error:", error)
    return NextResponse.json(
      { error: "Failed to fetch image", details: error.message },
      { status: 500 }
    )
  }
}
