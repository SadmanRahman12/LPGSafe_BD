import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Try DB first
    const dbModel = await prisma.aIModel.findFirst({
      where: { modelKey: id },
      include: {
        trainingRuns: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { predictions: true } },
      },
    });

    // Try live ML service
    let liveData: any = null;
    try {
      const res = await fetch(`${ML_URL}/models/${id}`, {
        headers: { "x-api-key": ML_KEY },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) liveData = await res.json();
    } catch { /* offline */ }

    if (!dbModel && !liveData) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      model: {
        ...liveData,
        dbRecord: dbModel,
        predictionCount: dbModel?._count.predictions || 0,
        recentTrainingRuns: dbModel?.trainingRuns || [],
      },
    });
  } catch (err: any) {
    console.error("AI model detail error:", err);
    return NextResponse.json({ error: "Failed to get model details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();
    const userId = (session.user as any).id;

    if (!["activate", "deactivate"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use 'activate' or 'deactivate'" }, { status: 400 });
    }

    const newStatus = action === "activate" ? "ACTIVE" : "INACTIVE";

    // Upsert AI model record
    const updated = await prisma.aIModel.upsert({
      where: { modelKey: id },
      update: {
        status: newStatus,
        activatedBy: action === "activate" ? userId : null,
        activatedAt: action === "activate" ? new Date() : null,
      },
      create: {
        modelKey: id,
        name: id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        algorithm: "Unknown",
        status: newStatus,
        task: "unknown",
        activatedBy: action === "activate" ? userId : null,
        activatedAt: action === "activate" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Model ${action}d successfully`,
      model: updated,
    });
  } catch (err: any) {
    console.error("AI model update error:", err);
    return NextResponse.json({ error: "Failed to update model status" }, { status: 500 });
  }
}
