import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificationStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cert = await prisma.certification.findUnique({
      where: { id },
      include: {
        dealer: true,
        inspector: { include: { user: true } },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, certificate: cert });
  } catch (err: any) {
    console.error("Error retrieving certificate:", err);
    return NextResponse.json({ error: "Failed to retrieve certificate" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "INSPECTOR") {
      return NextResponse.json({ error: "Only administrators or inspectors can update certification status" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, renewYears, notes } = body;

    const cert = await prisma.certification.findUnique({ where: { id } });
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status as CertificationStatus;
    }
    if (notes) {
      updateData.notes = notes;
    }
    if (renewYears && renewYears > 0) {
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + renewYears);
      updateData.expiresAt = newExpiry;
      updateData.status = CertificationStatus.APPROVED;
    }

    const updatedCert = await prisma.certification.update({
      where: { id },
      data: updateData,
      include: { dealer: true },
    });

    // Sync dealer certification status
    if (cert.dealerId) {
      const isApproved = updatedCert.status === "APPROVED";
      await prisma.dealer.update({
        where: { id: cert.dealerId },
        data: { isCertified: isApproved },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Certificate status updated successfully.",
      certificate: updatedCert,
    });
  } catch (err: any) {
    console.error("Error updating certificate:", err);
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 });
  }
}
