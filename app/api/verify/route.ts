import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ error: "Please provide a cylinder ID or QR serial" }, { status: 400 });
    }

    const cylinder = await prisma.cylinder.findFirst({
      where: {
        OR: [
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
        message: "No registered cylinder matches this serial or QR code in the national database. Exercise caution.",
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
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Failed to verify cylinder" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: "Please provide a cylinder ID or QR code" }, { status: 400 });
    }

    const cylinder = await prisma.cylinder.findFirst({
      where: {
        OR: [
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
        message: "No registered cylinder matches this serial or QR code in the national database.",
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
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Failed to verify cylinder" }, { status: 500 });
  }
}
