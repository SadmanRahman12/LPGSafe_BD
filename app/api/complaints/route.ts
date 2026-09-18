import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { complaintSchema } from "@/lib/validations/part2";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const trackingNumber = searchParams.get("trackingNumber");
    const dealerId = searchParams.get("dealerId");

    const whereClause: any = {};

    // Role-based filtering if logged in
    if (session?.user) {
      const role = (session.user as any).role;
      const userId = (session.user as any).id;
      const userDealerId = (session.user as any).dealerId;

      if (role === "CONSUMER") {
        whereClause.consumerId = userId;
      } else if (role === "DEALER" && userDealerId) {
        whereClause.dealerId = userDealerId;
      }
      // ADMIN and INSPECTOR can see all
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (category && category !== "ALL") {
      whereClause.category = category;
    }
    if (trackingNumber) {
      whereClause.trackingNumber = { contains: trackingNumber.trim(), mode: "insensitive" };
    }
    if (dealerId) {
      whereClause.dealerId = dealerId;
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            division: true,
            district: true,
            phone: true,
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
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err: any) {
    console.error("Error fetching complaints:", err);
    return NextResponse.json({ error: "Failed to retrieve complaints" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const parsed = complaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { category, dealerId, location, description, severity, photoUrl } = parsed.data;

    // Generate unique tracking number e.g. CMP-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `CMP-2026-${randomSuffix}`;

    const consumerId = session?.user ? (session.user as any).id : null;

    const complaint = await prisma.complaint.create({
      data: {
        trackingNumber,
        consumerId,
        dealerId: dealerId || null,
        category,
        severity: severity as any,
        status: "SUBMITTED",
        location,
        description,
        photoUrl: photoUrl || null,
      },
      include: {
        dealer: {
          select: {
            businessName: true,
            division: true,
          },
        },
      },
    });

    // Create initial timeline event
    await prisma.complaintUpdate.create({
      data: {
        complaintId: complaint.id,
        updatedById: consumerId,
        status: "SUBMITTED",
        comment: "Complaint lodged into the national LPGSafe registry. Pending administrative triage.",
      },
    });

    // Notify dealer if complaint targets a registered dealer
    if (dealerId) {
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        select: { userId: true },
      });
      if (dealer?.userId) {
        await prisma.notification.create({
          data: {
            userId: dealer.userId,
            title: `New Customer Complaint: ${category}`,
            message: `A complaint (${trackingNumber}) has been filed regarding your retail outlet. Immediate review advised.`,
            type: "COMPLAINT",
            linkUrl: `/complaints/${complaint.id}`,
          },
        });
      }
    }

    // Also notify consumer if logged in
    if (consumerId) {
      await prisma.notification.create({
        data: {
          userId: consumerId,
          title: `Complaint Lodged: ${trackingNumber}`,
          message: `Your complaint has been submitted with tracking ID ${trackingNumber}. Safety officers have been notified.`,
          type: "COMPLAINT",
          linkUrl: `/complaints/${complaint.id}`,
        },
      });
    }

    // Fire-and-forget AI complaint classification (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/ai/classify/complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: description,
        complaintId: complaint.id,
        systemCall: true,
      }),
    }).catch(() => { /* AI service offline — ignored */ });

    return NextResponse.json({
      success: true,
      message: "Complaint registered successfully",
      complaint,
    });
  } catch (err: any) {
    console.error("Error creating complaint:", err);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
