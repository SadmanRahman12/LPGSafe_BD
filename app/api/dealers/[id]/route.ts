import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Dealer ID is required" }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        certifications: {
          orderBy: { issuedAt: "desc" },
        },
        inspections: {
          orderBy: { inspectionDate: "desc" },
          take: 5,
          include: {
            items: true,
            inspector: {
              select: {
                badgeNumber: true,
                designation: true,
              },
            },
          },
        },
        inventory: {
          orderBy: { brand: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            consumer: {
              select: {
                name: true,
              },
            },
          },
        },
        cylinders: {
          where: { status: "VERIFIED" },
          take: 10,
          select: {
            id: true,
            serialNumber: true,
            brand: true,
            capacityKg: true,
            safetyScore: true,
            status: true,
          },
        },
      },
    });

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      dealer,
    });
  } catch (err: any) {
    console.error("Error fetching dealer details:", err);
    return NextResponse.json(
      { error: "Failed to fetch dealer details" },
      { status: 500 }
    );
  }
}
