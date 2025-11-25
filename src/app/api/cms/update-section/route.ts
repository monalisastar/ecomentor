import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * PATCH /api/cms/update-section
 * -----------------------------------------------------
 * Body: { pageSlug: string, sectionKey: string, content: any }
 * Saves or updates a single section override in the database.
 * -----------------------------------------------------
 */
export async function PATCH(req: Request) {
  try {
    const { pageSlug, sectionKey, content } = await req.json()

    if (!pageSlug || !sectionKey) {
      return NextResponse.json(
        { error: "Missing pageSlug or sectionKey" },
        { status: 400 }
      )
    }

    // ✅ Merge existing sections first
    const mergedSections = await mergeExistingSections(pageSlug, sectionKey, content)

    // ✅ Upsert page entry
    const page = await prisma.page.upsert({
      where: { slug: pageSlug },
      update: { sections: mergedSections },
      create: {
        slug: pageSlug,
        title: `${pageSlug} Page`,
        sections: { [sectionKey]: content },
        type: "PAGE",
        status: "PUBLISHED",
      },
    })

    return NextResponse.json({
      success: true,
      message: `Section '${sectionKey}' updated successfully`,
      page,
    })
  } catch (error) {
    console.error("❌ Error updating CMS section:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * 🧠 Helper: merge existing sections
 * Ensures updates don’t overwrite other sections on the same page.
 */
async function mergeExistingSections(
  pageSlug: string,
  key: string,
  value: any
): Promise<Record<string, any>> {
  const existing = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { sections: true },
  })

  let currentSections: Record<string, any> = {}

  // 🧩 Parse safely if sections exist
  if (existing?.sections && typeof existing.sections === "object") {
    currentSections = existing.sections as Record<string, any>
  } else if (typeof existing?.sections === "string") {
    try {
      currentSections = JSON.parse(existing.sections)
    } catch {
      currentSections = {}
    }
  }

  // ✅ Merge and return
  return { ...currentSections, [key]: value }
}
