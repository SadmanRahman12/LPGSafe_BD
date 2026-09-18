import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get("resolved") === "true";
    const type = searchParams.get("type");

    const where: any = { isResolved: resolved };
    if (type) where.type = type;

    const [alerts, total] = await Promise.all([
      prisma.aIAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.aIAlert.count({ where }),
    ]);

    // Summary counts
    const [highRiskCount, priceAnomalyCount, demandShortageCount, complaintPriorityCount] =
      await Promise.all([
        prisma.aIAlert.count({ where: { type: "HIGH_RISK_DEALER", isResolved: false } }),
        prisma.aIAlert.count({ where: { type: "PRICE_ANOMALY", isResolved: false } }),
        prisma.aIAlert.count({ where: { type: "DEMAND_SHORTAGE", isResolved: false } }),
        prisma.aIAlert.count({ where: { type: "COMPLAINT_PRIORITY", isResolved: false } }),
      ]);

    return NextResponse.json({
      success: true,
      alerts,
      total,
      summary: {
        highRiskDealers: highRiskCount,
        priceAnomalies: priceAnomalyCount,
        demandShortages: demandShortageCount,
        complaintPriorities: complaintPriorityCount,
        totalUnresolved: highRiskCount + priceAnomalyCount + demandShortageCount + complaintPriorityCount,
      },
    });
  } catch (err: any) {
    console.error("AI alerts error:", err);
    return NextResponse.json({ error: "Failed to fetch AI alerts" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { alertId, resolveNote } = await req.json();
    const userId = (session.user as any).id;

    const updated = await prisma.aIAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
        resolveNote: resolveNote || "Resolved by administrator",
      },
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (err: any) {
    console.error("AI alert resolve error:", err);
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 });
  }
}
