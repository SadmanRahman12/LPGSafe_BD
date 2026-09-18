import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Cylinder identifier is required" }, { status: 400 });
    }

    const cylinder = await prisma.cylinder.findFirst({
      where: {
        OR: [
          { id },
          { serialNumber: { equals: id, mode: "insensitive" } },
          { qrCode: { equals: id, mode: "insensitive" } },
        ],
      },
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            division: true,
            district: true,
            upazila: true,
            phone: true,
            address: true,
            isCertified: true,
            rating: true,
          },
        },
      },
    });

    if (!cylinder) {
      return NextResponse.json(
        {
          success: false,
          error: "Cylinder not found in national registry",
          status: "NOT_VERIFIED",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cylinder,
    });
  } catch (err: any) {
    console.error("Error fetching cylinder details:", err);
    return NextResponse.json(
      { error: "Failed to fetch cylinder details" },
      { status: 500 }
    );
  }
}
