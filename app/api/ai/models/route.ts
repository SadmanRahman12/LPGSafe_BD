import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get DB records
    const dbModels = await prisma.aIModel.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { predictions: true, trainingRuns: true } },
      },
    });

    // Also try to get live status from ML service
    let liveModels: any[] = [];
    let mlServiceAvailable = false;
    try {
      const res = await fetch(`${ML_URL}/models`, {
        headers: { "x-api-key": ML_KEY },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        liveModels = data.models || [];
        mlServiceAvailable = true;
      }
    } catch {
      // Offline
    }

    // Merge DB + live data
    const merged = liveModels.map((lm: any) => {
      const db = dbModels.find((m) => m.modelKey === lm.id);
      return {
        ...lm,
        dbId: db?.id,
        dbStatus: db?.status,
        predictionCount: db?._count.predictions || 0,
        trainingRunCount: db?._count.trainingRuns || 0,
        activatedAt: db?.activatedAt,
      };
    });

    // If ML service offline, just return DB models
    if (!mlServiceAvailable) {
      return NextResponse.json({
        success: true,
        mlServiceAvailable: false,
        models: dbModels.map((m) => ({
          id: m.modelKey,
          name: m.name,
          algorithm: m.algorithm,
          dbId: m.id,
          dbStatus: m.status,
          is_trained: !!m.trainingDate,
          training_date: m.trainingDate,
          dataset_size: m.datasetSize,
          metrics: m.metricsJson ? JSON.parse(m.metricsJson) : null,
          predictionCount: m._count.predictions,
          trainingRunCount: m._count.trainingRuns,
        })),
      });
    }

    return NextResponse.json({ success: true, mlServiceAvailable: true, models: merged });
  } catch (err: any) {
    console.error("AI models list error:", err);
    return NextResponse.json({ error: "Failed to list AI models" }, { status: 500 });
  }
}
