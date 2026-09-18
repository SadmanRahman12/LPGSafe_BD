import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Complaint ID is required" }, { status: 400 });
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { trackingNumber: { equals: id, mode: "insensitive" } },
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
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        updates: {
          orderBy: { createdAt: "asc" },
          include: {
            updatedBy: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      complaint,
    });
  } catch (err: any) {
    console.error("Error retrieving complaint:", err);
    return NextResponse.json({ error: "Failed to retrieve complaint" }, { status: 500 });
  }
}
