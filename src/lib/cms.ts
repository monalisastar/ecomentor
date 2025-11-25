import prisma from "@/lib/prisma"

// ✅ Static imports (Next.js-safe)
import * as HeroSection from "@/components/HeroSection"
import * as FeaturesSection from "@/components/FeaturesSection"
import * as ImpactSection from "@/components/ImpactSection"
import * as JoinCTA from "@/components/JoinCTA"
import * as AboutEcoMentor from "@/components/AboutEcoMentor"

// ✅ About Us page components
import * as Hero from "@/app/about/components/Hero"
import * as Philosophy from "@/app/about/components/Philosophy"
import * as CTASection from "@/app/about/components/CTASection"
import * as Timeline from "@/app/about/components/Timeline"
import * as TrustMeter from "@/app/about/components/TrustMeter"

/**
 * 🌿 getMergedContent(pageSlug)
 * --------------------------------------------------
 * Loads static section data for marketing pages and
 * merges it with any CMS edits from the DB.
 * --------------------------------------------------
 */
export async function getMergedContent(pageSlug: string) {
  const staticModules = loadStaticModules(pageSlug)

  // 🔍 Fetch DB overrides (if any)
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { sections: true },
  })

  // ✅ Safely parse DB sections
  let dbSections: Record<string, any> = {}
  if (page?.sections && typeof page.sections === "object") {
    dbSections = page.sections as Record<string, any>
  } else if (typeof page?.sections === "string") {
    try {
      dbSections = JSON.parse(page.sections)
    } catch {
      dbSections = {}
    }
  }

  // 🧬 Merge static + DB overrides
  const merged: Record<string, any> = {}
  for (const [key, staticData] of Object.entries(staticModules)) {
    const dbData = dbSections[key] || {}
    merged[key] = { ...staticData, ...dbData }
  }

  return merged
}

/**
 * 🧩 loadStaticModules()
 * --------------------------------------------------
 * Static imports ensure compatibility with Next.js 15+
 * --------------------------------------------------
 */
function loadStaticModules(pageSlug: string) {
  const modules: Record<string, any> = {}

  if (pageSlug === "home") {
    if (HeroSection.staticData) modules["HeroSection"] = HeroSection.staticData
    if (FeaturesSection.staticData)
      modules["FeaturesSection"] = FeaturesSection.staticData
    if (ImpactSection.staticData) modules["ImpactSection"] = ImpactSection.staticData
    if (JoinCTA.staticData) modules["JoinCTA"] = JoinCTA.staticData
    if (AboutEcoMentor.staticData)
      modules["AboutEcoMentor"] = AboutEcoMentor.staticData
  }

  if (pageSlug === "about-us") {
    if (Hero.staticData) modules["Hero"] = Hero.staticData
    if (Philosophy.staticData) modules["Philosophy"] = Philosophy.staticData
    if (CTASection.staticData) modules["CTASection"] = CTASection.staticData
    if (Timeline.staticData) modules["Timeline"] = Timeline.staticData
    if (TrustMeter.staticData) modules["TrustMeter"] = TrustMeter.staticData
  }

  return modules
}

/**
 * ✏️ upsertSectionContent()
 * --------------------------------------------------
 * Updates or creates a single editable section.
 * Used by /api/sections/[pageSlug]/[sectionKey]
 * --------------------------------------------------
 */
export async function upsertSectionContent(
  pageSlug: string,
  sectionKey: string,
  content: any
) {
  const existing = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { sections: true },
  })

  // ✅ Safely clone existing sections
  let sections: Record<string, any> = {}
  if (existing?.sections && typeof existing.sections === "object") {
    sections = existing.sections as Record<string, any>
  } else if (typeof existing?.sections === "string") {
    try {
      sections = JSON.parse(existing.sections)
    } catch {
      sections = {}
    }
  }

  sections[sectionKey] = content

  return prisma.page.upsert({
    where: { slug: pageSlug },
    update: { sections },
    create: {
      slug: pageSlug,
      title: `${pageSlug} Page`,
      sections,
      type: "PAGE",
      status: "PUBLISHED",
    },
  })
}

/**
 * 🧠 getSectionContent()
 * --------------------------------------------------
 * Fetches a single section (merged static + DB edit)
 * --------------------------------------------------
 */
export async function getSectionContent(pageSlug: string, sectionKey: string) {
  const merged = await getMergedContent(pageSlug)
  return merged[sectionKey] || null
}


















































