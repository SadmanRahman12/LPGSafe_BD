import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const certifiedOnly = searchParams.get("certified") === "true";
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (division && division !== "ALL") {
      whereClause.division = { equals: division, mode: "insensitive" };
    }

    if (district && district !== "ALL") {
      whereClause.district = { equals: district, mode: "insensitive" };
    }

    if (certifiedOnly) {
      whereClause.isCertified = true;
    }

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { upazila: { contains: search, mode: "insensitive" } },
      ];
    }

    const dealers = await prisma.dealer.findMany({
      where: whereClause,
      include: {
        certifications: {
          where: { status: "APPROVED" },
          take: 1,
        },
      },
      orderBy: [{ isCertified: "desc" }, { rating: "desc" }],
    });

    return NextResponse.json({ success: true, count: dealers.length, dealers });
  } catch (err: any) {
    console.error("Error fetching dealers:", err);
    return NextResponse.json(
      { error: "Failed to retrieve dealers" },
      { status: 500 }
    );
  }
}
