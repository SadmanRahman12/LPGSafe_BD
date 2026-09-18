import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DeviceStatus, RiskLevel } from "@prisma/client";

export async function GET() {
  try {
    const [devices, alerts] = await Promise.all([
      prisma.ioTDevice.findMany({
        include: {
          dealer: { select: { businessName: true, division: true, district: true } },
          consumer: { select: { name: true, phone: true } },
          alerts: {
            where: { isResolved: false },
            orderBy: { alertTimestamp: "desc" },
          },
        },
        orderBy: { lastHeartbeat: "desc" },
      }),
      prisma.leakageAlert.findMany({
        where: { isResolved: false },
        include: {
          device: {
            include: {
              consumer: { select: { name: true, phone: true } },
              dealer: { select: { businessName: true } },
            },
          },
        },
        orderBy: { alertTimestamp: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: devices.length,
      activeAlertsCount: alerts.length,
      devices,
      alerts,
    });
  } catch (err: any) {
    console.error("Error fetching IoT devices:", err);
    return NextResponse.json({ error: "Failed to load IoT telemetry" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceSerial, gasLevelPpm, temperatureC, batteryLevel } = body;

    if (!deviceSerial) {
      return NextResponse.json({ error: "deviceSerial is required" }, { status: 400 });
    }

    const ppm = gasLevelPpm !== undefined ? parseFloat(gasLevelPpm) : 15.0;
    const temp = temperatureC !== undefined ? parseFloat(temperatureC) : 26.0;
    const batt = batteryLevel !== undefined ? parseInt(batteryLevel) : 95;

    // Determine device status based on physical deterministic threshold
    let newStatus: DeviceStatus = DeviceStatus.ONLINE;
    let isLeakage = false;

    if (ppm >= 250.0) {
      newStatus = DeviceStatus.CRITICAL;
      isLeakage = true;
    } else if (ppm >= 100.0) {
      newStatus = DeviceStatus.WARNING;
    }

    let device = await prisma.ioTDevice.findUnique({
      where: { deviceSerial },
      include: { consumer: true, dealer: true },
    });

    if (!device) {
      // Create if demo device
      device = await prisma.ioTDevice.create({
        data: {
          deviceSerial,
          deviceName: `Telemetry Unit (${deviceSerial})`,
          locationDescription: "Simulated Domestic Cylinder Bay",
          gasLevelPpm: ppm,
          temperatureC: temp,
          batteryLevel: batt,
          status: newStatus,
          lastHeartbeat: new Date(),
        },
        include: { consumer: true, dealer: true },
      });
    } else {
      device = await prisma.ioTDevice.update({
        where: { deviceSerial },
        data: {
          gasLevelPpm: ppm,
          temperatureC: temp,
          batteryLevel: batt,
          status: newStatus,
          lastHeartbeat: new Date(),
        },
        include: { consumer: true, dealer: true },
      });
    }

    // If active leak, create LeakageAlert and trigger notifications
    let alert = null;
    if (isLeakage) {
      alert = await prisma.leakageAlert.create({
        data: {
          deviceId: device.id,
          ppmLevel: ppm,
          severity: RiskLevel.CRITICAL,
          alertTimestamp: new Date(),
        },
      });

      // Send emergency notification to consumer or dealer if attached
      const recipientId = device.consumerId || device.dealer?.userId;
      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            title: "🚨 DANGER: LPG Gas Leakage Detected!",
            message: `Emergency sensor ${device.deviceName} recorded dangerous gas concentration of ${ppm.toFixed(1)} PPM. Evacuate immediately and shut off regulator valve!`,
            type: "IOT",
            linkUrl: "/iot",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: isLeakage ? "CRITICAL ALERT: Gas threshold exceeded! Siren triggered." : "Telemetry updated.",
      device,
      alert,
    });
  } catch (err: any) {
    console.error("Error ingesting IoT telemetry:", err);
    return NextResponse.json({ error: "Failed to process sensor telemetry" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { alertId, resolvedNotes } = body;

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const alert = await prisma.leakageAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedNotes: resolvedNotes || "Resolved by user/technician after cylinder isolation.",
      },
      include: { device: true },
    });

    // Reset device status to ONLINE if no more active alerts
    const remainingAlerts = await prisma.leakageAlert.count({
      where: { deviceId: alert.deviceId, isResolved: false },
    });

    if (remainingAlerts === 0) {
      await prisma.ioTDevice.update({
        where: { id: alert.deviceId },
        data: { status: DeviceStatus.ONLINE, gasLevelPpm: 18.0 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Emergency alert marked resolved.",
      alert,
    });
  } catch (err: any) {
    console.error("Error resolving alert:", err);
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 });
  }
}
