import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    if (!user.roles.includes("lecturer")) {
      return NextResponse.json({ error: "Only lecturers can request payouts" }, { status: 403 });
    }

    const { amount } = await req.json();
    if (!amount) return NextResponse.json({ error: "Missing amount" }, { status: 400 });

    const payout = await prisma.payout.create({
      data: {
        lecturerId: user.id,
        amount,
        status: "requested",
      },
    });

    return NextResponse.json(payout, { status: 201 });

  } catch (error) {
    console.error("Error creating payout:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user } = session;
    let payouts;

    if (user.roles.includes("lecturer")) {
      // Lecturer sees only their payouts
      payouts = await prisma.payout.findMany({
        where: { lecturerId: user.id },
        orderBy: { requestedAt: "desc" },
      });
    } else if (user.roles.includes("admin")) {
      // Admin sees all payouts
      payouts = await prisma.payout.findMany({
        orderBy: { requestedAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(payouts, { status: 200 });

  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
