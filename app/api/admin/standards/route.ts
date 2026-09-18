import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const standards = await prisma.safetyStandard.findMany({
      orderBy: { effectiveYear: "desc" },
    });
    return NextResponse.json({ success: true, count: standards.length, standards });
  } catch (err: any) {
    console.error("Error fetching standards:", err);
    return NextResponse.json({ error: "Failed to retrieve safety standards" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { code, title, regulatoryBody, category, description, requirementsText, isMandatory, effectiveYear } = body;

    if (!code || !title || !description || !requirementsText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const standard = await prisma.safetyStandard.create({
      data: {
        code,
        title,
        regulatoryBody: regulatoryBody || "BSTI / Dept of Explosives",
        category: category || "Cylinder Manufacturing & Testing",
        description,
        requirementsText,
        isMandatory: isMandatory ?? true,
        effectiveYear: effectiveYear ? parseInt(effectiveYear) : new Date().getFullYear(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Safety standard created successfully.",
      standard,
    });
  } catch (err: any) {
    console.error("Error creating standard:", err);
    return NextResponse.json({ error: "Failed to create safety standard" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isMandatory, description, requirementsText } = body;

    if (!id) {
      return NextResponse.json({ error: "Standard ID is required" }, { status: 400 });
    }

    const updated = await prisma.safetyStandard.update({
      where: { id },
      data: {
        isMandatory: isMandatory !== undefined ? isMandatory : undefined,
        description: description || undefined,
        requirementsText: requirementsText || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Safety standard updated successfully.",
      standard: updated,
    });
  } catch (err: any) {
    console.error("Error updating standard:", err);
    return NextResponse.json({ error: "Failed to update safety standard" }, { status: 500 });
  }
}
