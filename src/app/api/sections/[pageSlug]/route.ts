import { NextResponse } from "next/server";
import { getMergedContent } from "@/lib/cms";

/**
 * GET /api/sections/[pageSlug]
 * ----------------------------------------------------
 * Returns merged static + DB section data for a page.
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
  } catch (error) {
    console.error("Error fetching page sections:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
