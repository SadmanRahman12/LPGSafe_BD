import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_KEY = process.env.ML_API_KEY || "dev-ml-secret-key";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();

    let prediction: any = null;
    let mlServiceAvailable = false;

    try {
      const mlRes = await fetch(`${ML_URL}/forecast/demand`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ML_KEY },
        body: JSON.stringify(body),
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

    // Check for shortage condition (if prev demand >> predicted → possible shortage)
    const shortageRatio = body.prev_week_demand / (prediction.predicted_demand_kg || 1);
    if (shortageRatio > 1.25) {
      await prisma.aIAlert.create({
        data: {
          type: "DEMAND_SHORTAGE",
          title: `Predicted Demand Shortage — ${body.district}`,
          description: `Forecasted demand (${prediction.predicted_demand_kg} kg) is significantly below previous week (${body.prev_week_demand} kg). Potential supply shortage in ${body.district}, ${body.division}.`,
          entityType: "DISTRICT",
          entityId: `${body.division}:${body.district}`,
          severity: "MEDIUM",
        },
      });
    }

    return NextResponse.json({ success: true, prediction });
  } catch (err: any) {
    console.error("Demand forecast error:", err);
    return NextResponse.json({ error: "Failed to generate demand forecast" }, { status: 500 });
  }
}
