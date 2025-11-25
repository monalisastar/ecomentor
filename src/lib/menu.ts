import prisma from "@/lib/prisma";

/**
 * 🧭 getMenuItems()
 * Combines static navbar items with any dynamic CMS items.
 * Static = code pages you already have (Home, Courses, About, etc.)
 * Dynamic = CMS pages marked as "showInMenu = true".
 */
export async function getMenuItems() {
  // 1️⃣ Static base menu (your permanent routes)
  const staticMenu = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "FAQ", href: "/faq" },
  ];

  // 2️⃣ Fetch dynamic pages from database
  let dynamicMenu: { label: string; href: string }[] = [];
  try {
    const dynamicPages = await prisma.page.findMany({
      where: { showInMenu: true },
      select: { menuLabel: true, slug: true },
    });

    dynamicMenu = dynamicPages.map((p) => ({
      label: p.menuLabel || p.slug,
      href: `/${p.slug}`,
    }));
  } catch (err) {
    console.error("⚠️ Failed to load dynamic menu items:", err);
  }

  // 3️⃣ Combine both safely (static always first)
  return [...staticMenu, ...dynamicMenu];
}
