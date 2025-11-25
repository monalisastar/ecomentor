import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcrypt";
import { sendStaffCredentials } from "@/lib/mailer";

/**
 * ✅ GET /api/admin/staff
 * Lists all staff and lecturers for admin dashboard
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const userRole =
    (token as any)?.role ||
    (Array.isArray((token as any)?.roles)
      ? (token as any).roles[0]
      : "student");

  if (!token?.email || userRole !== "admin") {
    console.warn("❌ Unauthorized access attempt:", token?.email, userRole);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await prisma.user.findMany({
    where: { roles: { hasSome: ["staff", "lecturer"] } },
    select: {
      id: true,
      name: true,
      email: true,
      roles: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(staff);
}

/**
 * ✅ POST /api/admin/staff
 * Allows admin to invite/add new staff or lecturer.
 * Generates a secure temporary password and emails it.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const userRole =
      (token as any)?.role ||
      (Array.isArray((token as any)?.roles)
        ? (token as any).roles[0]
        : "student");

    if (!token?.email || userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    // 🔍 Prevent duplicates
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 🔑 Generate a random temporary password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 💾 Create new staff record
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: [role || "staff"],
        status: "INVITED",
      },
    });

    // ✉️ Send login details
    await sendStaffCredentials({
      name,
      email,
      password: plainPassword,
    });

    return NextResponse.json({
      success: true,
      message: "Staff member added and email sent.",
      user: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        roles: newStaff.roles,
      },
    });
  } catch (err: any) {
    console.error("❌ Error adding staff:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
