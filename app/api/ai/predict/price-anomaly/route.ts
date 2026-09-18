import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dealerId, priceRecordId, systemCall, ...priceFeatures } = body;

    if (!systemCall) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const role = (session.user as any).role;
      if (role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
    }

    let prediction: any = null;
    let mlServiceAvailable = false;

    try {
      const mlRes = await fetch(`${ML_URL}/detect/price-anomaly`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ML_KEY },
        body: JSON.stringify({ dealer_id: dealerId, ...priceFeatures }),
        signal: AbortSignal.timeout(10000),
      });
      if (mlRes.ok) {
        prediction = await mlRes.json();
        mlServiceAvailable = true;
      }
    } catch {
      // Graceful degradation
    }

    if (!mlServiceAvailable) {
      return NextResponse.json({
        success: false,
        mlServiceAvailable: false,
        message: "AI service not available. See ml/README.md for setup.",
      });
    }

    const aiModel = await prisma.aIModel.findFirst({
      where: { modelKey: "price_anomaly_model" },
    }).catch(() => null);

    // Save prediction
    const entityId = priceRecordId || dealerId || "unknown";
    const saved = await prisma.aIPrediction.create({
      data: {
        modelId: aiModel?.id || null,
        modelKey: "price_anomaly_model",
        entityType: priceRecordId ? "PRICE_RECORD" : "DEALER",
        entityId,
        inputJson: JSON.stringify(priceFeatures),
        outputJson: JSON.stringify(prediction),
        isAnomaly: prediction.is_anomaly,
        riskScore: prediction.anomaly_score * 100,
      },
    });

    // Create alert if anomaly
    if (prediction.is_anomaly) {
      await prisma.aIAlert.create({
        data: {
          type: "PRICE_ANOMALY",
          title: "Potential Price Anomaly Detected",
          description: `Price deviation: ${prediction.price_deviation_pct}%. Anomaly score: ${(prediction.anomaly_score * 100).toFixed(1)}/100. Human review required.`,
          entityType: priceRecordId ? "PRICE_RECORD" : "DEALER",
          entityId,
          severity: "HIGH",
          predictionId: saved.id,
        },
      });
    }

    return NextResponse.json({ success: true, prediction, predictionId: saved.id });
  } catch (err: any) {
    console.error("Price anomaly detection error:", err);
    return NextResponse.json({ error: "Failed to run price anomaly detection" }, { status: 500 });
  }
}
