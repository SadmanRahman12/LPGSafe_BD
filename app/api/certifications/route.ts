import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificationStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const entityType = searchParams.get("entityType");
    const dealerId = searchParams.get("dealerId");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status as CertificationStatus;
    }
    if (entityType && entityType !== "ALL") {
      whereClause.entityType = entityType;
    }
    if (dealerId) {
      whereClause.dealerId = dealerId;
    }

    const certifications = await prisma.certification.findMany({
      where: whereClause,
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            division: true,
            district: true,
            address: true,
            isCertified: true,
          },
        },
        inspector: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    const now = new Date();
    const stats = {
      total: certifications.length,
      approved: certifications.filter((c) => c.status === "APPROVED").length,
      expired: certifications.filter((c) => c.status === "EXPIRED" || new Date(c.expiresAt) < now).length,
      pending: certifications.filter((c) => c.status === "PENDING").length,
      suspended: certifications.filter((c) => c.status === "SUSPENDED").length,
    };

    return NextResponse.json({ success: true, stats, certifications });
  } catch (err: any) {
    console.error("Error fetching certifications:", err);
    return NextResponse.json({ error: "Failed to retrieve certifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "INSPECTOR") {
      return NextResponse.json({ error: "Only administrators or inspectors can issue certificates" }, { status: 403 });
    }

    const body = await req.json();
    const { dealerId, entityType = "DEALER", validYears = 2, notes } = body;

    if (!dealerId) {
      return NextResponse.json({ error: "Dealer ID is required" }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }

    let inspectorId = (session.user as any).inspectorId;
    if (!inspectorId) {
      const defaultInspector = await prisma.inspector.findFirst({ where: { active: true } });
      inspectorId = defaultInspector?.id;
    }

    const divisionCode = dealer.division.substring(0, 3).toUpperCase();
    const count = await prisma.certification.count();
    const certNumber = `CERT-LPG-${divisionCode}-2026-${String(count + 1001).padStart(5, "0")}`;

    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + validYears);

    const certification = await prisma.certification.create({
      data: {
        certificateNumber: certNumber,
        entityType,
        entityId: dealerId,
        dealerId,
        inspectorId,
        issuedAt,
        expiresAt,
        status: CertificationStatus.APPROVED,
        qrCode: `https://lpgsafe.gov.bd/certs/${dealerId}`,
        notes: notes || "Statutory compliance certificate issued under Explosives Act 1884 & BDS 1530:2008.",
      },
      include: {
        dealer: true,
        inspector: { include: { user: true } },
      },
    });

    await prisma.dealer.update({
      where: { id: dealerId },
      data: { isCertified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Certificate issued successfully.",
      certification,
    });
  } catch (err: any) {
    console.error("Error issuing certificate:", err);
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
  }
}
