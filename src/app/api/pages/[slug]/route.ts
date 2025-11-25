import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET a single page by slug
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const page = await prisma.page.findUnique({ where: { slug: params.slug } });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json(page);
  } catch (err) {
    console.error("Error fetching page:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH update a page
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  try {
    const data = await req.json();
    const updated = await prisma.page.update({
      where: { slug: params.slug },
      data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating page:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a page
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    await prisma.page.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting page:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
