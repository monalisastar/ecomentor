import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Missing email or role" }, { status: 400 });
    }

    // Lowercase normalization
    const targetEmail = email.toLowerCase();

    // Whitelisted special emails allowed without active session
    const specialEmails = [
      "njatabrian648@gmail.com",
      "virginia.njata@gmail.com",
      "trizer.trio56@gmail.com",
    ];

    // Try to get active NextAuth session
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.toLowerCase();

    const isAdmin = (session?.user as any)?.role === "admin";
    const isSelf = sessionEmail === targetEmail;
    const isSpecial = specialEmails.includes(sessionEmail || targetEmail);

    // 🚨 Check authorization
    if (!session && !specialEmails.includes(targetEmail)) {
      console.warn(`❌ Unauthorized: no session for ${targetEmail}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session && !isSelf && !isAdmin && !isSpecial) {
      console.warn(`❌ Unauthorized attempt by ${sessionEmail} to set ${targetEmail}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Proceed to update or create user
    let user = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (user) {
      user = await prisma.user.update({
        where: { email: targetEmail },
        data: { roles: [role] },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: targetEmail.split("@")[0],
          roles: [role],
          password: "",
        },
      });
    }

    console.log(`✅ Role updated successfully: ${targetEmail} → ${role}`);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      role,
      message: "Role updated successfully. Please sign in again to refresh session.",
    });
  } catch (err: any) {
    console.error("❌ Set role error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
