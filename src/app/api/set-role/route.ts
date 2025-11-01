import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Missing role" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, role });
    response.cookies.set("eco_mentor_role", role, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`✅ Role cookie set to: ${role}`);
    return response;
  } catch (error) {
    console.error("❌ Error setting role cookie:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
