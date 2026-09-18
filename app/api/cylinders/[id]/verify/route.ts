import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = id?.trim();

    if (!query) {
      return NextResponse.json({ error: "Cylinder ID is required" }, { status: 400 });
    }

    const cylinder = await prisma.cylinder.findFirst({
      where: {
        OR: [
          { id: query },
          { serialNumber: { equals: query, mode: "insensitive" } },
          { qrCode: { equals: query, mode: "insensitive" } },
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
            isCertified: true,
          },
        },
      },
    });

    if (!cylinder) {
      return NextResponse.json({
        success: true,
        verified: false,
        status: "NOT_VERIFIED",
        message: "No registered cylinder matches this identifier in the national database.",
        queriedId: query,
      });
    }

    return NextResponse.json({
      success: true,
      verified: cylinder.status === "VERIFIED",
      status: cylinder.status,
      cylinder,
    });
  } catch (err: any) {
    console.error("Cylinder verification error:", err);
    return NextResponse.json({ error: "Failed to verify cylinder" }, { status: 500 });
  }
}
