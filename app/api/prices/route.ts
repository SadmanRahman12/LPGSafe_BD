import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const cylinderSize = searchParams.get("cylinderSize");

    const whereClause: any = {};
    if (division && division !== "ALL") {
      whereClause.division = { equals: division, mode: "insensitive" };
    }
    if (district && district !== "ALL") {
      whereClause.district = { equals: district, mode: "insensitive" };
    }
    if (cylinderSize) {
      whereClause.cylinderSizeKg = parseFloat(cylinderSize);
    }

    const priceRecords = await prisma.priceRecord.findMany({
      where: whereClause,
      include: {
        dealer: {
          select: {
            id: true,
            businessName: true,
            division: true,
            district: true,
            upazila: true,
            isCertified: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Reference rate (BERC 12kg)
    const referencePrice = 1455.0;
    const prices = priceRecords.map((r) => r.reportedPrice);
    const avgPrice =
      prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : referencePrice;
    const minPrice = prices.length > 0 ? Math.min(...prices) : referencePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : referencePrice;

    // Division aggregates for visual charts
    const divisionStats: Record<string, { total: number; count: number; min: number; max: number }> = {};
    for (const r of priceRecords) {
      const div = r.division || "Unknown";
      if (!divisionStats[div]) {
        divisionStats[div] = { total: 0, count: 0, min: r.reportedPrice, max: r.reportedPrice };
      }
      divisionStats[div].total += r.reportedPrice;
      divisionStats[div].count += 1;
      if (r.reportedPrice < divisionStats[div].min) divisionStats[div].min = r.reportedPrice;
      if (r.reportedPrice > divisionStats[div].max) divisionStats[div].max = r.reportedPrice;
    }

    const chartData = Object.entries(divisionStats).map(([divisionName, s]) => ({
      division: divisionName,
      avgPrice: Math.round(s.total / s.count),
      minPrice: s.min,
      maxPrice: s.max,
      referencePrice,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        referencePrice,
        averagePrice: avgPrice,
        lowestPrice: minPrice,
        highestPrice: maxPrice,
        totalReports: priceRecords.length,
      },
      chartData,
      records: priceRecords,
    });
  } catch (err: any) {
    console.error("Error fetching prices:", err);
    return NextResponse.json({ error: "Failed to fetch price records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { dealerId, division, district, cylinderSizeKg = 12.0, reportedPrice } = body;

    if (!division || !district || !reportedPrice || reportedPrice <= 0) {
      return NextResponse.json(
        { error: "Division, district, and a valid positive price are required" },
        { status: 400 }
      );
    }

    const price = parseFloat(reportedPrice);
    const size = parseFloat(cylinderSizeKg);
    const bercReferencePrice12Kg = 1455.0;
    const isViolation = size === 12.0 && price > bercReferencePrice12Kg + 50.0;

    // If a dealer is submitting their own price, update their profile price too
    let targetDealerId = dealerId;
    if (session?.user && (session.user as any).role === "DEALER") {
      targetDealerId = (session.user as any).dealerId || targetDealerId;
      if (targetDealerId) {
        await prisma.dealer.update({
          where: { id: targetDealerId },
          data: { currentLpgPrice: price },
        });
      }
    }

    const newRecord = await prisma.priceRecord.create({
      data: {
        dealerId: targetDealerId || null,
        division,
        district,
        cylinderSizeKg: size,
        reportedPrice: price,
        referencePrice: bercReferencePrice12Kg,
        isViolation,
        reportedBy: session?.user?.email || "CONSUMER_OBSERVATION",
        effectiveDate: new Date(),
      },
      include: {
        dealer: {
          select: {
            businessName: true,
            district: true,
          },
        },
      },
    });

    // Fire-and-forget AI anomaly check (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/ai/predict/price-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dealerId: targetDealerId || "unknown",
        priceRecordId: newRecord.id,
        systemCall: true,
        cylinder_size_kg: size,
        reported_price: price,
        reference_price: bercReferencePrice12Kg,
        historical_avg_price: bercReferencePrice12Kg,
        regional_avg_price: bercReferencePrice12Kg,
        day_of_week: new Date().getDay(),
        month: new Date().getMonth() + 1,
      }),
    }).catch(() => { /* AI service offline — ignored */ });

    return NextResponse.json({
      success: true,
      record: newRecord,
      message: isViolation
        ? "Price recorded. Flagged for review against BERC standard."
        : "Price recorded successfully.",
    });
  } catch (err: any) {
    console.error("Error submitting price observation:", err);
    return NextResponse.json({ error: "Failed to record price" }, { status: 500 });
  }
}
