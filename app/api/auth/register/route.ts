import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  consumerRegisterSchema,
  dealerRegisterSchema,
  inspectorRegisterSchema,
} from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role } = body;

    // Safety rule: Admin accounts cannot be created via public registration
    if (role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Administrative accounts can only be provisioned by authorized personnel." },
        { status: 403 }
      );
    }

    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "A valid account role is required (CONSUMER, DEALER, or INSPECTOR)." },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email?.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    if (role === UserRole.CONSUMER) {
      const parsed = consumerRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message || "Invalid input data" },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase().trim(),
          passwordHash,
          phone: parsed.data.phone,
          role: UserRole.CONSUMER,
          division: parsed.data.division,
          district: parsed.data.district,
          address: parsed.data.address,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Consumer account registered successfully.",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    if (role === UserRole.DEALER) {
      const parsed = dealerRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message || "Invalid input data" },
          { status: 400 }
        );
      }

      // Check trade license uniqueness
      const existingLicense = await prisma.dealer.findUnique({
        where: { tradeLicense: parsed.data.tradeLicense.trim() },
      });

      if (existingLicense) {
        return NextResponse.json(
          { error: "A dealership with this trade license number is already registered." },
          { status: 409 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase().trim(),
          passwordHash,
          phone: parsed.data.phone,
          role: UserRole.DEALER,
          division: parsed.data.division,
          district: parsed.data.district,
          upazila: parsed.data.upazila,
          address: parsed.data.address,
          dealerProfile: {
            create: {
              businessName: parsed.data.businessName,
              tradeLicense: parsed.data.tradeLicense.trim(),
              division: parsed.data.division,
              district: parsed.data.district,
              upazila: parsed.data.upazila,
              address: parsed.data.address,
              phone: parsed.data.phone,
              email: parsed.data.email.toLowerCase().trim(),
              isCertified: false, // New dealer requires initial inspection & certification
              status: "PENDING_VERIFICATION",
            },
          },
        },
        include: { dealerProfile: true },
      });

      return NextResponse.json({
        success: true,
        message: "Dealer account created. Application is pending regulatory inspection.",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    if (role === UserRole.INSPECTOR) {
      const parsed = inspectorRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message || "Invalid input data" },
          { status: 400 }
        );
      }

      // Check badge uniqueness
      const existingBadge = await prisma.inspector.findUnique({
        where: { badgeNumber: parsed.data.badgeNumber.trim() },
      });

      if (existingBadge) {
        return NextResponse.json(
          { error: "An inspector with this badge number already exists." },
          { status: 409 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase().trim(),
          passwordHash,
          phone: parsed.data.phone,
          role: UserRole.INSPECTOR,
          division: parsed.data.division,
          district: parsed.data.district,
          inspectorProfile: {
            create: {
              badgeNumber: parsed.data.badgeNumber.trim(),
              department: parsed.data.department,
              designation: parsed.data.designation,
              division: parsed.data.division,
              district: parsed.data.district,
              phone: parsed.data.phone,
              active: true,
            },
          },
        },
        include: { inspectorProfile: true },
      });

      return NextResponse.json({
        success: true,
        message: "Inspector account registered successfully.",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    return NextResponse.json({ error: "Unsupported registration role" }, { status: 400 });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
