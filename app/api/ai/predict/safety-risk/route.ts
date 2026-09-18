import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dealerId, systemCall, ...features } = body;

    if (!systemCall) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const role = (session.user as any).role;
      if (role !== "INSPECTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Inspector or Admin access required" }, { status: 403 });
      }
    }

    if (!dealerId) {
      return NextResponse.json({ error: "dealerId is required" }, { status: 400 });
    }

    // Look up active AI model record
    const aiModel = await prisma.aIModel.findFirst({
      where: { modelKey: "safety_risk_model" },
    }).catch(() => null);

    // Call Python ML service
    let prediction: any = null;
    let mlServiceAvailable = false;

    try {
      const mlRes = await fetch(`${ML_URL}/predict/safety-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ML_KEY },
        body: JSON.stringify({ dealer_id: dealerId, ...features }),
        signal: AbortSignal.timeout(10000),
      });
      if (mlRes.ok) {
        prediction = await mlRes.json();
        mlServiceAvailable = true;
      }
    } catch {
      // ML service not available - return graceful degradation
    }

    if (!mlServiceAvailable) {
      return NextResponse.json({
        success: false,
        mlServiceAvailable: false,
        message:
          "AI service is not currently available. Ensure the Python ML service is running. See ml/README.md for setup.",
      });
    }

    // Save prediction to DB
    const saved = await prisma.aIPrediction.create({
      data: {
        modelId: aiModel?.id || null,
        modelKey: "safety_risk_model",
        entityType: "DEALER",
        entityId: dealerId,
        inputJson: JSON.stringify(features),
        outputJson: JSON.stringify(prediction),
        riskScore: prediction.risk_score,
        riskLevel: prediction.risk_level,
      },
    });

    // If HIGH or CRITICAL, create an AIAlert
    if (["HIGH", "CRITICAL"].includes(prediction.risk_level)) {
      await prisma.aIAlert.create({
        data: {
          type: "HIGH_RISK_DEALER",
          title: `${prediction.risk_level} Risk Dealer Detected`,
          description: `AI risk score: ${prediction.risk_score}/100. Factors: ${prediction.contributing_factors?.slice(0, 2).join(", ")}.`,
          entityType: "DEALER",
          entityId: dealerId,
          severity: prediction.risk_level === "CRITICAL" ? "CRITICAL" : "HIGH",
          predictionId: saved.id,
        },
      });
    }

    return NextResponse.json({ success: true, prediction, predictionId: saved.id });
  } catch (err: any) {
    console.error("Safety risk prediction error:", err);
    return NextResponse.json({ error: "Failed to run safety risk prediction" }, { status: 500 });
  }
}
