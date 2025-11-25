import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all pages
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pages);
  } catch (err) {
    console.error("Error fetching pages:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST new page
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const created = await prisma.page.create({ data });
    return NextResponse.json(created);
  } catch (err) {
    console.error("Error creating page:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
