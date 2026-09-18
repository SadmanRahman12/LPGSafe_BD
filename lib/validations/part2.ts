import { z } from "zod";

export const complaintSchema = z.object({
  category: z.enum([
    "OVERPRICING",
    "UNSAFE_INSTALLATION",
    "GAS_LEAKAGE",
    "DAMAGED_CYLINDER",
    "POOR_EQUIPMENT",
    "UNLICENSED_DEALER",
    "OTHER",
  ]),
  dealerId: z.string().optional().nullable(),
  location: z.string().min(3, "Location details are required (minimum 3 characters)"),
  description: z.string().min(10, "Please provide at least 10 characters describing the safety or pricing issue"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  photoUrl: z.string().optional().nullable(),
});

export const inventoryUpdateSchema = z.object({
  brand: z.string().min(2, "Brand name is required"),
  cylinderSizeKg: z.number().positive().default(12.0),
  currentStock: z.number().int().min(0, "Stock must be a non-negative number"),
  minStockAlert: z.number().int().min(1).default(10),
  status: z.enum([
    "IN_STOCK",
    "SOLD",
    "RESERVED",
    "RETURNED",
    "INSPECTION_REQUIRED",
  ]).default("IN_STOCK"),
});

export const priceReportSchema = z.object({
  dealerId: z.string().optional().nullable(),
  division: z.string().min(2, "Division is required"),
  district: z.string().min(2, "District is required"),
  cylinderSizeKg: z.number().positive().default(12.0),
  reportedPrice: z.number().positive("Reported price must be greater than 0"),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
export type PriceReportInput = z.infer<typeof priceReportSchema>;
