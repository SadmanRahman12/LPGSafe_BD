import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    // Parallel fetch counts
    const [
      totalDealers,
      certifiedDealers,
      totalCylinders,
      verifiedCylinders,
      expiredCylinders,
      totalUsers,
      totalInspections,
      passedInspections,
      failedInspections,
      openComplaints,
      resolvedComplaints,
      priceViolations,
      activeAlerts,
      totalDepots,
      certifications,
      depots,
      dealers,
      complaints,
      priceRecords,
    ] = await Promise.all([
      prisma.dealer.count(),
      prisma.dealer.count({ where: { isCertified: true } }),
      prisma.cylinder.count(),
      prisma.cylinder.count({ where: { status: "VERIFIED" } }),
      prisma.cylinder.count({ where: { status: "EXPIRED" } }),
      prisma.user.count(),
      prisma.inspection.count(),
      prisma.inspection.count({ where: { overallResult: "PASS" } }),
      prisma.inspection.count({ where: { overallResult: "FAIL" } }),
      prisma.complaint.count({ where: { status: { notIn: ["RESOLVED", "REJECTED"] } } }),
      prisma.complaint.count({ where: { status: "RESOLVED" } }),
      prisma.priceRecord.count({ where: { isViolation: true } }),
      prisma.leakageAlert.count({ where: { isResolved: false } }),
      prisma.supplyDepot.count(),
      prisma.certification.findMany({ select: { status: true, issuedAt: true, expiresAt: true } }),
      prisma.supplyDepot.findMany({ select: { division: true, capacityMetricTons: true, currentStockMetricTons: true } }),
      prisma.dealer.findMany({ select: { id: true, businessName: true, division: true, district: true, isCertified: true, currentLpgPrice: true, rating: true, latitude: true, longitude: true } }),
      prisma.complaint.findMany({ select: { category: true, severity: true, status: true, createdAt: true } }),
      prisma.priceRecord.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
    ]);

    // Calculate Regional Stock (Metric Tons)
    const regionalStockMetricTons = depots.reduce((acc: number, d) => acc + d.currentStockMetricTons, 0);

    // Division breakdown for Map & Analytics
    const divisionStats: Record<string, { total: number; certified: number; pending: number }> = {};
    const divisions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Barishal", "Rangpur", "Mymensingh"];
    divisions.forEach((div) => {
      divisionStats[div] = { total: 0, certified: 0, pending: 0 };
    });

    dealers.forEach((d) => {
      if (!divisionStats[d.division]) {
        divisionStats[d.division] = { total: 0, certified: 0, pending: 0 };
      }
      divisionStats[d.division].total++;
      if (d.isCertified) {
        divisionStats[d.division].certified++;
      } else {
        divisionStats[d.division].pending++;
      }
    });

    // Complaint categories distribution
    const complaintDistribution: Record<string, number> = {};
    complaints.forEach((c) => {
      complaintDistribution[c.category] = (complaintDistribution[c.category] || 0) + 1;
    });

    // Safety Compliance Rate
    const complianceRate = totalDealers > 0 ? ((certifiedDealers / totalDealers) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      success: true,
      stats: {
        totalDealers,
        certifiedDealers,
        complianceRate,
        totalCylinders,
        verifiedCylinders,
        expiredCylinders,
        totalUsers,
        totalInspections,
        passedInspections,
        failedInspections,
        pendingInspections: totalInspections - passedInspections - failedInspections,
        openComplaints,
        resolvedComplaints,
        priceViolations,
        activeAlerts,
        totalDepots,
        regionalStockMetricTons: Math.round(regionalStockMetricTons),
      },
      divisionStats: Object.entries(divisionStats).map(([division, data]) => ({
        division,
        ...data,
      })),
      complaintDistribution: Object.entries(complaintDistribution).map(([category, count]) => ({
        category: category.replace(/_/g, " "),
        count,
      })),
      dealers,
    });
  } catch (err: any) {
    console.error("Error fetching admin statistics:", err);
    return NextResponse.json({ error: "Failed to generate administrative analytics" }, { status: 500 });
  }
}
