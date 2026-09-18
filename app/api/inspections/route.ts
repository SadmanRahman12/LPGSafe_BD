import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InspectionResult, RiskLevel } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const result = searchParams.get("result");
    const risk = searchParams.get("risk");
    const dealerId = searchParams.get("dealerId");
    const inspectorId = searchParams.get("inspectorId");

    const whereClause: any = {};

    if (session?.user) {
      const role = (session.user as any).role;
      const userInspectorId = (session.user as any).inspectorId;
      const userDealerId = (session.user as any).dealerId;

      if (role === "INSPECTOR" && userInspectorId) {
        whereClause.inspectorId = userInspectorId;
      } else if (role === "DEALER" && userDealerId) {
        whereClause.dealerId = userDealerId;
      }
    }

    if (result && result !== "ALL") {
      whereClause.overallResult = result as InspectionResult;
    }
    if (risk && risk !== "ALL") {
      whereClause.riskLevel = risk as RiskLevel;
    }
    if (dealerId) {
      whereClause.dealerId = dealerId;
    }
    if (inspectorId) {
      whereClause.inspectorId = inspectorId;
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            division: true,
            district: true,
            upazila: true,
            address: true,
            isCertified: true,
            latitude: true,
            longitude: true,
          },
        },
        inspector: {
          select: {
            id: true,
            badgeNumber: true,
            department: true,
            designation: true,
            user: {
              select: { name: true, phone: true },
            },
          },
        },
        items: true,
      },
      orderBy: { inspectionDate: "desc" },
    });

    const stats = {
      total: inspections.length,
      passed: inspections.filter((i) => i.overallResult === "PASS").length,
      failed: inspections.filter((i) => i.overallResult === "FAIL").length,
      conditional: inspections.filter((i) => i.overallResult === "CONDITIONAL").length,
      highRisk: inspections.filter((i) => i.riskLevel === "HIGH" || i.riskLevel === "CRITICAL").length,
    };

    return NextResponse.json({ success: true, stats, inspections });
  } catch (err: any) {
    console.error("Error fetching inspections:", err);
    return NextResponse.json({ error: "Failed to retrieve inspections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "INSPECTOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Only certified inspectors or admins can schedule inspections" }, { status: 403 });
    }

    const body = await req.json();
    const { dealerId, notes, scheduledDate } = body;

    if (!dealerId) {
      return NextResponse.json({ error: "Dealer ID is required" }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) {
      return NextResponse.json({ error: "Target dealer not found" }, { status: 404 });
    }

    let inspectorId = (session.user as any).inspectorId;
    if (!inspectorId) {
      // If admin, find first active inspector
      const firstInspector = await prisma.inspector.findFirst({ where: { active: true } });
      if (!firstInspector) {
        return NextResponse.json({ error: "No active inspector found to assign" }, { status: 400 });
      }
      inspectorId = firstInspector.id;
    }

    const count = await prisma.inspection.count();
    const inspectionNumber = `INSP-2026-${dealer.division.substring(0, 2).toUpperCase()}-${String(count + 1).padStart(5, "0")}`;

    // Standard 5 statutory checklist groups
    const defaultChecklist = [
      // 1. Cylinder
      { category: "Cylinder", itemTitle: "Condition acceptable & free of severe corrosion" },
      { category: "Cylinder", itemTitle: "No visible denting, gouging, or unauthorized weld repairs" },
      { category: "Cylinder", itemTitle: "Hydrostatic test date collar stamp is within statutory 10-yr validity" },
      // 2. Regulator
      { category: "Regulator", itemTitle: "Approved low-pressure specification (28-30 mbar BSTI certified)" },
      { category: "Regulator", itemTitle: "Valve locking collar snaps securely with zero lateral play" },
      // 3. Rubber Tube
      { category: "Rubber Tube", itemTitle: "BSTI approved steel-wire reinforced orange rubber hose" },
      { category: "Rubber Tube", itemTitle: "No surface micro-cracks and within 2-year replacement cycle" },
      { category: "Rubber Tube", itemTitle: "Heavy-duty screw clamps secured on both regulator and stove nozzles" },
      // 4. Installation
      { category: "Installation", itemTitle: "Minimum 1-meter horizontal separation distance from stove burner" },
      { category: "Installation", itemTitle: "Adequate natural ground-level kitchen air ventilation" },
      // 5. Storage
      { category: "Storage", itemTitle: "Vertical upright positioning on a flat, dry, level surface" },
      { category: "Storage", itemTitle: "Valid dry-chemical ABC fire extinguisher present and charged" },
      { category: "Storage", itemTitle: "Safe electrical clearances (no exposed junction boxes or motors)" },
    ];

    const inspection = await prisma.inspection.create({
      data: {
        inspectionNumber,
        entityType: "DEALER",
        entityId: dealer.id,
        dealerId: dealer.id,
        inspectorId,
        inspectionDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        overallResult: InspectionResult.CONDITIONAL,
        riskLevel: RiskLevel.MEDIUM,
        notes: notes || "Scheduled statutory compliance inspection.",
        latitude: dealer.latitude,
        longitude: dealer.longitude,
        items: {
          create: defaultChecklist.map((item) => ({
            category: item.category,
            itemTitle: item.itemTitle,
            result: "PASS",
            severity: "LOW",
          })),
        },
      },
      include: {
        items: true,
        dealer: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inspection scheduled successfully.",
      inspection,
    });
  } catch (err: any) {
    console.error("Error creating inspection:", err);
    return NextResponse.json({ error: "Failed to schedule inspection" }, { status: 500 });
  }
}
