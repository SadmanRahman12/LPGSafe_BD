import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const [depots, distributions, dealers] = await Promise.all([
      prisma.supplyDepot.findMany({
        include: {
          distributions: {
            take: 5,
            orderBy: { dispatchDate: "desc" },
            include: {
              targetDealer: {
                select: { businessName: true, division: true, district: true },
              },
            },
          },
        },
        orderBy: { capacityMetricTons: "desc" },
      }),
      prisma.distributionRecord.findMany({
        take: 30,
        orderBy: { dispatchDate: "desc" },
        include: {
          sourceDepot: {
            select: { name: true, code: true, division: true },
          },
          targetDealer: {
            select: { businessName: true, division: true, district: true, currentLpgPrice: true },
          },
        },
      }),
      prisma.dealer.findMany({
        select: {
          id: true,
          businessName: true,
          division: true,
          district: true,
          inventory: {
            select: { brand: true, currentStock: true, minStockAlert: true },
          },
        },
      }),
    ]);

    // Aggregate national supply metrics
    const totalCapacity = depots.reduce((sum: number, d) => sum + d.capacityMetricTons, 0);
    const currentStock = depots.reduce((sum: number, d) => sum + d.currentStockMetricTons, 0);
    const utilizationRate = totalCapacity > 0 ? ((currentStock / totalCapacity) * 100).toFixed(1) : "0.0";

    // Low stock warnings
    const lowStockAlerts = dealers
      .filter((d) => d.inventory.some((i) => i.currentStock <= i.minStockAlert))
      .map((d) => ({
        dealerId: d.id,
        dealerName: d.businessName,
        division: d.division,
        district: d.district,
        lowItems: d.inventory.filter((i) => i.currentStock <= i.minStockAlert),
      }));

    return NextResponse.json({
      success: true,
      summary: {
        totalCapacityMetricTons: totalCapacity,
        currentStockMetricTons: currentStock,
        utilizationRate,
        activeShipments: distributions.filter((d) => d.status === "IN_TRANSIT").length,
        deliveredShipments: distributions.filter((d) => d.status === "DELIVERED").length,
        lowStockOutletsCount: lowStockAlerts.length,
      },
      depots,
      distributions,
      lowStockAlerts,
    });
  } catch (err: any) {
    console.error("Error fetching supply chain data:", err);
    return NextResponse.json({ error: "Failed to load supply chain telemetry" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { sourceDepotId, targetDealerId, batchNumber, quantity, cylinderSizeKg } = body;

    if (!sourceDepotId || !targetDealerId || !quantity) {
      return NextResponse.json({ error: "Depot, Dealer, and Quantity are required" }, { status: 400 });
    }

    const count = await prisma.distributionRecord.count();
    const batch = batchNumber || `DIST-2026-${String(count + 1).padStart(5, "0")}`;

    const record = await prisma.distributionRecord.create({
      data: {
        sourceDepotId,
        targetDealerId,
        batchNumber: batch,
        quantity: parseInt(quantity),
        cylinderSizeKg: cylinderSizeKg ? parseFloat(cylinderSizeKg) : 12.0,
        status: "DISPATCHED",
        dispatchDate: new Date(),
      },
      include: {
        sourceDepot: true,
        targetDealer: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Distribution shipment logged successfully.",
      record,
    });
  } catch (err: any) {
    console.error("Error creating distribution shipment:", err);
    return NextResponse.json({ error: "Failed to log distribution record" }, { status: 500 });
  }
}
