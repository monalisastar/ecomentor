import { NextResponse } from "next/server";
import { getMergedContent } from "@/lib/cms";

/**
 * GET /api/sections/[pageSlug]
 * ----------------------------------------------------
 * Returns all section content for a page by merging
 * static defaults with DB overrides.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ pageSlug: string }> }
) {
  const { pageSlug } = await context.params;

  try {
    const data = await getMergedContent(pageSlug);
    if (!data) {
      return NextResponse.json({ error: "No content found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error fetching sections:", err);
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
}
