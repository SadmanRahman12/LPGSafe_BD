import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const whereClause: any = {};
    if (role && role !== "ALL") {
      whereClause.role = role as UserRole;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        division: true,
        district: true,
        createdAt: true,
        dealerProfile: {
          select: { id: true, businessName: true, isCertified: true },
        },
        inspectorProfile: {
          select: { id: true, badgeNumber: true, active: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to retrieve user registry" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and Role are required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} role updated to ${updatedUser.role}.`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Failed to update user record" }, { status: 500 });
  }
}
