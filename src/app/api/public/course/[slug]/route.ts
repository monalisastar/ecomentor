import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        priceUSD: true,
        published: true,
        category: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // ❗ We only allow checkout of published courses
    if (!course.published) {
      return NextResponse.json(
        {
          error:
            "This course is not available for enrollment yet. Please check soon.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    console.error("PUBLIC COURSE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load course" },
      { status: 500 }
    );
  }
}
