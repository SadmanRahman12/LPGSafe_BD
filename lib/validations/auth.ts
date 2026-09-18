import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const consumerRegisterSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
});

export const dealerRegisterSchema = z.object({
  name: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  businessName: z.string().min(2, "Business name is required"),
  tradeLicense: z.string().min(4, "Trade license number is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  address: z.string().min(5, "Physical shop address is required"),
});

export const inspectorRegisterSchema = z.object({
  name: z.string().min(2, "Officer name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  badgeNumber: z.string().min(3, "Official badge number is required"),
  department: z.string().min(2, "Department name is required"),
  designation: z.string().min(2, "Designation is required"),
  division: z.string().min(1, "Assigned division is required"),
  district: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ConsumerRegisterInput = z.infer<typeof consumerRegisterSchema>;
export type DealerRegisterInput = z.infer<typeof dealerRegisterSchema>;
export type InspectorRegisterInput = z.infer<typeof inspectorRegisterSchema>;
