import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function POST(req: Request) {
  try {
    // This can be called internally (no user session required for system auto-calls)
    const body = await req.json();
    const { text, complaintId, systemCall } = body;

    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Complaint text is required" }, { status: 400 });
    }

    // If not a system call, require auth
    if (!systemCall) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    }

    let prediction: any = null;
    let mlServiceAvailable = false;

    try {
      const mlRes = await fetch(`${ML_URL}/classify/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ML_KEY },
        body: JSON.stringify({ text, complaint_id: complaintId }),
        signal: AbortSignal.timeout(8000),
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
        message: "AI classification service not available.",
      });
    }

    const aiModel = await prisma.aIModel.findFirst({
      where: { modelKey: "complaint_classifier" },
    }).catch(() => null);

    // Save prediction
    const entityId = complaintId || "unknown";
    const saved = await prisma.aIPrediction.create({
      data: {
        modelId: aiModel?.id || null,
        modelKey: "complaint_classifier",
        entityType: "COMPLAINT",
        entityId,
        inputJson: JSON.stringify({ text: text.slice(0, 500) }),
        outputJson: JSON.stringify(prediction),
        confidence: prediction.confidence,
        predictedLabel: prediction.predicted_category,
      },
    });

    // Create high-priority alert for safety-related complaints
    const safetyCategories = ["GAS_LEAKAGE", "DAMAGED_CYLINDER", "UNSAFE_INSTALLATION"];
    if (
      safetyCategories.includes(prediction.predicted_category) &&
      prediction.confidence > 0.6
    ) {
      await prisma.aIAlert.create({
        data: {
          type: "COMPLAINT_PRIORITY",
          title: `High-Priority Complaint: ${prediction.predicted_category.replace(/_/g, " ")}`,
          description: `AI classified complaint as ${prediction.predicted_category} with ${(prediction.confidence * 100).toFixed(0)}% confidence. Priority: ${prediction.priority_suggestion}. Human review required.`,
          entityType: "COMPLAINT",
          entityId,
          severity: "HIGH",
          predictionId: saved.id,
        },
      });
    }

    return NextResponse.json({ success: true, prediction, predictionId: saved.id });
  } catch (err: any) {
    console.error("Complaint classification error:", err);
    return NextResponse.json({ error: "Failed to classify complaint" }, { status: 500 });
  }
}
