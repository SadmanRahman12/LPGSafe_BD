import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    let dealerId = searchParams.get("dealerId");

    // If dealer user, automatically scope to their own dealerId
    if (session?.user && (session.user as any).role === "DEALER") {
      dealerId = (session.user as any).dealerId;
    }

    if (!dealerId) {
      return NextResponse.json(
        { error: "Dealer ID is required to view inventory" },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.findMany({
      where: { dealerId },
      orderBy: { brand: "asc" },
    });

    const totalCylinders = inventory.reduce((acc, item) => acc + item.currentStock, 0);
    const lowStockItems = inventory.filter((item) => item.currentStock <= item.minStockAlert);

    return NextResponse.json({
      success: true,
      stats: {
        totalStock: totalCylinders,
        distinctBrands: inventory.length,
        lowStockCount: lowStockItems.length,
      },
      inventory,
    });
  } catch (err: any) {
    console.error("Error fetching inventory:", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    let dealerId = (session.user as any).dealerId;

    if (userRole !== "DEALER" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Dealer only." }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      brand,
      cylinderSizeKg = 12.0,
      currentStock = 0,
      minStockAlert = 10,
      status = "IN_STOCK",
      action = "ADD", // "ADD", "SALE", "UPDATE"
      quantity = 1,
    } = body;

    if (userRole === "ADMIN" && body.dealerId) {
      dealerId = body.dealerId;
    }

    if (!dealerId) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 400 });
    }

    if (action === "SALE") {
      // Record a sale: decrement stock for given inventory ID
      if (!id) {
        return NextResponse.json({ error: "Inventory item ID is required to record sale" }, { status: 400 });
      }

      const item = await prisma.inventory.findUnique({ where: { id } });
      if (!item) {
        return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
      }

      const newStock = Math.max(0, item.currentStock - Number(quantity));
      const updatedItem = await prisma.inventory.update({
        where: { id },
        data: {
          currentStock: newStock,
          status: newStock === 0 ? "SOLD" : item.status,
        },
      });

      // If low stock, create notification
      if (newStock <= updatedItem.minStockAlert) {
        await prisma.notification.create({
          data: {
            userId: (session.user as any).id,
            title: `Low Stock Warning: ${updatedItem.brand} (${updatedItem.cylinderSizeKg}kg)`,
            message: `Current stock has fallen to ${newStock} units (threshold: ${updatedItem.minStockAlert}). Order resupply from regional depot.`,
            type: "SYSTEM",
            linkUrl: "/dealer/inventory",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Sale recorded. Dispensed ${quantity} cylinder(s).`,
        item: updatedItem,
      });
    }

    if (action === "UPDATE" && id) {
      const updatedItem = await prisma.inventory.update({
        where: { id },
        data: {
          currentStock: Number(currentStock),
          minStockAlert: Number(minStockAlert),
          status: status as any,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Inventory updated successfully.",
        item: updatedItem,
      });
    }

    // Default: "ADD" new stock item or increment existing brand
    const existing = await prisma.inventory.findFirst({
      where: {
        dealerId,
        brand: { equals: brand.trim(), mode: "insensitive" },
        cylinderSizeKg: Number(cylinderSizeKg),
      },
    });

    if (existing) {
      const updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          currentStock: existing.currentStock + Number(currentStock),
          minStockAlert: Number(minStockAlert) || existing.minStockAlert,
          status: "IN_STOCK",
        },
      });
      return NextResponse.json({
        success: true,
        message: `Added ${currentStock} cylinder(s) to ${brand}.`,
        item: updated,
      });
    }

    const newItem = await prisma.inventory.create({
      data: {
        dealerId,
        brand: brand.trim(),
        cylinderSizeKg: Number(cylinderSizeKg),
        currentStock: Number(currentStock),
        minStockAlert: Number(minStockAlert),
        status: status as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Created inventory record for ${brand}.`,
      item: newItem,
    });
  } catch (err: any) {
    console.error("Error modifying inventory:", err);
    return NextResponse.json({ error: "Failed to process inventory request" }, { status: 500 });
  }
}
