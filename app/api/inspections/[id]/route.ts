import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InspectionResult, RiskLevel, ChecklistResult, CertificationStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        dealer: {
          include: {
            certifications: {
              where: { status: "APPROVED" },
              take: 1,
            },
          },
        },
        inspector: {
          include: {
            user: {
              select: { name: true, phone: true, email: true },
            },
          },
        },
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inspection });
  } catch (err: any) {
    console.error("Error fetching inspection:", err);
    return NextResponse.json({ error: "Failed to retrieve inspection" }, { status: 500 });
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
    if (role !== "INSPECTOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only authorized inspectors or administrators can submit digital audit reports" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      overallResult,
      riskLevel,
      notes,
      evidencePhotoUrl,
      signature,
      items,
    } = body;

    const existingInspection = await prisma.inspection.findUnique({
      where: { id },
      include: { dealer: true },
    });

    if (!existingInspection) {
      return NextResponse.json({ error: "Inspection record not found" }, { status: 404 });
    }

    // Update checklist items if supplied
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          await prisma.inspectionItem.update({
            where: { id: item.id },
            data: {
              result: item.result as ChecklistResult,
              severity: (item.severity as RiskLevel) || "LOW",
              notes: item.notes || null,
              photoUrl: item.photoUrl || null,
            },
          });
        }
      }
    }

    // Update inspection record
    const updatedInspection = await prisma.inspection.update({
      where: { id },
      data: {
        overallResult: (overallResult as InspectionResult) || existingInspection.overallResult,
        riskLevel: (riskLevel as RiskLevel) || existingInspection.riskLevel,
        notes: notes !== undefined ? notes : existingInspection.notes,
        evidencePhotoUrl: evidencePhotoUrl || existingInspection.evidencePhotoUrl,
        signature: signature || existingInspection.signature,
        inspectionDate: new Date(),
      },
      include: {
        items: true,
        dealer: true,
        inspector: {
          include: { user: true },
        },
      },
    });

    // Certification workflow side-effect:
    // If overallResult is PASS and dealer exists, update or issue certification
    if (overallResult === "PASS" && existingInspection.dealerId) {
      const dealerId = existingInspection.dealerId;
      
      // Update dealer certification flag
      await prisma.dealer.update({
        where: { id: dealerId },
        data: {
          isCertified: true,
          status: "ACTIVE",
        },
      });

      // Find or create dealer certification
      const existingCert = await prisma.certification.findFirst({
        where: { dealerId, status: "APPROVED" },
      });

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years statutory validity

      if (existingCert) {
        await prisma.certification.update({
          where: { id: existingCert.id },
          data: {
            expiresAt: expiryDate,
            status: CertificationStatus.APPROVED,
            notes: `Renewed following successful inspection ${updatedInspection.inspectionNumber}.`,
          },
        });
      } else {
        const divisionCode = existingInspection.dealer?.division.substring(0, 3).toUpperCase() || "DHK";
        const certCount = await prisma.certification.count();
        const certNumber = `CERT-LPG-${divisionCode}-2026-${String(certCount + 1001).padStart(5, "0")}`;

        await prisma.certification.create({
          data: {
            certificateNumber: certNumber,
            entityType: "DEALER",
            entityId: dealerId,
            dealerId: dealerId,
            inspectorId: updatedInspection.inspectorId,
            issuedAt: new Date(),
            expiresAt: expiryDate,
            status: CertificationStatus.APPROVED,
            qrCode: `https://lpgsafe.gov.bd/certs/${dealerId}`,
            notes: `Issued pursuant to Explosives Dept. Clearance BDS 1530:2008 inspection ${updatedInspection.inspectionNumber}.`,
          },
        });
      }

      // Notify dealer
      if (existingInspection.dealer?.userId) {
        await prisma.notification.create({
          data: {
            userId: existingInspection.dealer.userId,
            title: "Safety Audit Passed & Certificate Updated",
            message: `Congratulations! Your retail outlet passed inspection ${updatedInspection.inspectionNumber}. Your safety certification is valid through ${expiryDate.toLocaleDateString()}.`,
            type: "CERTIFICATION",
            linkUrl: `/dealers/${dealerId}`,
          },
        });
      }
    } else if (overallResult === "FAIL" && existingInspection.dealerId) {
      // Suspend dealer certification if failed
      await prisma.dealer.update({
        where: { id: existingInspection.dealerId },
        data: { isCertified: false },
      });

      await prisma.certification.updateMany({
        where: { dealerId: existingInspection.dealerId, status: "APPROVED" },
        data: {
          status: CertificationStatus.SUSPENDED,
          notes: `Suspended due to safety audit failure in inspection ${updatedInspection.inspectionNumber}. Immediate remediation required.`,
        },
      });

      if (existingInspection.dealer?.userId) {
        await prisma.notification.create({
          data: {
            userId: existingInspection.dealer.userId,
            title: "Urgent: Safety Audit Failed - Certification Suspended",
            message: `Inspection ${updatedInspection.inspectionNumber} recorded safety violations. Your certification is suspended until re-inspection clearance.`,
            type: "SECURITY",
            linkUrl: `/dealers/${existingInspection.dealerId}`,
          },
        });
      }
    }

    // Fire-and-forget AI safety risk assessment (non-blocking)
    if (existingInspection.dealerId) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const failedItems = items ? items.filter((it: any) => it.result === "FAIL").length : 0;
      fetch(`${baseUrl}/api/ai/predict/safety-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: existingInspection.dealerId,
          systemCall: true,
          inspection_failures: failedItems,
          previous_violations: overallResult === "FAIL" ? 1 : 0,
          complaints_last_90_days: 0,
          leakage_complaints: items?.some((it: any) => it.result === "FAIL" && it.category === "Rubber Tube") ? 1 : 0,
          certification_expired: overallResult === "FAIL" ? 1 : 0,
          cylinder_age_days: 365,
          regulator_condition_enc: items?.some((it: any) => it.result === "FAIL" && it.category === "Regulator") ? 2 : 0,
          tube_condition_enc: items?.some((it: any) => it.result === "FAIL" && it.category === "Rubber Tube") ? 2 : 0,
          installation_ok: items?.some((it: any) => it.result === "FAIL" && it.category === "Installation") ? 0 : 1,
          storage_ok: items?.some((it: any) => it.result === "FAIL" && it.category === "Storage") ? 0 : 1,
          ventilation_ok: 1,
          fire_equipment: 1,
          days_since_inspection: 0,
        }),
      }).catch(() => { /* AI service offline - ignored */ });
    }

    return NextResponse.json({
      success: true,
      message: "Digital inspection submitted and compliance records updated successfully.",
      inspection: updatedInspection,
    });
  } catch (err: any) {
    console.error("Error updating inspection:", err);
    return NextResponse.json({ error: "Failed to submit digital inspection" }, { status: 500 });
  }
}
