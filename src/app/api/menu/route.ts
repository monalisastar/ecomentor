import { NextResponse } from "next/server";
import { getMenuItems } from "@/lib/menu";

/**
 * 🧭 API Route: /api/menu
 * -----------------------------------------------------
 * Returns the merged list of navbar menu items:
 *  - Static items (hardcoded)
 *  - Dynamic CMS pages (where showInMenu = true)
 * Used by Navbar to auto-update navigation.
 */
export async function GET() {
  try {
    const menu = await getMenuItems();
    return NextResponse.json(menu);
  } catch (err) {
    console.error("Menu fetch error:", err);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
