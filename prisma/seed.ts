import { PrismaClient, UserRole, CylinderStatus, CertificationStatus, InspectionResult, RiskLevel, ChecklistResult, InventoryStatus, ComplaintCategory, ComplaintStatus, DeviceStatus, AIModelStatus, AIAlertType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LPGSafe Bangladesh database seeding...");

  // Clean existing records in reverse dependency order
  await prisma.aIAlert.deleteMany();
  await prisma.aIPrediction.deleteMany();
  await prisma.aITrainingRun.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.leakageAlert.deleteMany();
  await prisma.ioTDevice.deleteMany();
  await prisma.review.deleteMany();
  await prisma.complaintUpdate.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.distributionRecord.deleteMany();
  await prisma.supplyDepot.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.priceRecord.deleteMany();
  await prisma.inspectionItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.cylinder.deleteMany();
  await prisma.inspector.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.safetyArticle.deleteMany();
  await prisma.safetyStandard.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const commonPasswordHash = await bcrypt.hash("SafePass123!", saltRounds);

  // 1. Create Core Users
  console.log("Creating default demo accounts...");
  
  const consumerUser = await prisma.user.create({
    data: {
      email: "consumer@example.com",
      passwordHash: commonPasswordHash,
      name: "Tariqul Islam",
      phone: "+8801711000001",
      role: UserRole.CONSUMER,
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Dhanmondi",
      address: "House 42, Road 7A, Dhanmondi, Dhaka",
    },
  });

  const dealerUser = await prisma.user.create({
    data: {
      email: "dealer@example.com",
      passwordHash: commonPasswordHash,
      name: "Abdul Karim (Dealer Admin)",
      phone: "+8801811000002",
      role: UserRole.DEALER,
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Gulshan",
      address: "Plot 18, Block B, Gulshan-2, Dhaka",
    },
  });

  const inspectorUser = await prisma.user.create({
    data: {
      email: "inspector@example.com",
      passwordHash: commonPasswordHash,
      name: "Engr. Mahmudul Hasan",
      phone: "+8801911000003",
      role: UserRole.INSPECTOR,
      division: "Dhaka",
      district: "Dhaka",
      address: "Department of Explosives, Segunbagicha, Dhaka",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: commonPasswordHash,
      name: "System Administrator",
      phone: "+8801511000004",
      role: UserRole.ADMIN,
      division: "Dhaka",
      district: "Dhaka",
      address: "Energy and Mineral Resources Division, Bangladesh Secretariat, Dhaka",
    },
  });

  // 2. Create Inspector Profile
  const inspectorProfile = await prisma.inspector.create({
    data: {
      userId: inspectorUser.id,
      badgeNumber: "EXP-DH-2024-0089",
      department: "Department of Explosives",
      designation: "Senior Safety & Enforcement Officer",
      division: "Dhaka",
      district: "Dhaka",
      phone: inspectorUser.phone!,
      active: true,
    },
  });

  // 3. Create Dealers across Bangladesh 8 Divisions
  console.log("Creating dealers across 8 divisions...");

  const dealersData = [
    {
      user: dealerUser,
      businessName: "Bashundhara LPG Point - Gulshan",
      tradeLicense: "TR-DCC-2023-99412",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Gulshan",
      address: "Plot 18, Block B, Gulshan-2, Dhaka",
      latitude: 23.7925,
      longitude: 90.4078,
      phone: "+8801811000002",
      email: "dealer@example.com",
      isCertified: true,
      rating: 4.8,
      totalReviews: 124,
      currentLpgPrice: 1450.0,
    },
    {
      userData: {
        email: "ctg.dealer@example.com",
        name: "Nurul Huda",
        phone: "+8801822000010",
      },
      businessName: "Karnaphuli Gas & Cylinder Hub",
      tradeLicense: "TR-CCC-2023-55102",
      division: "Chattogram",
      district: "Chattogram",
      upazila: "Agrabad",
      address: "45 Sheikh Mujib Road, Agrabad C/A, Chattogram",
      latitude: 22.3243,
      longitude: 91.8142,
      phone: "+8801822000010",
      isCertified: true,
      rating: 4.6,
      totalReviews: 89,
      currentLpgPrice: 1440.0,
    },
    {
      userData: {
        email: "raj.dealer@example.com",
        name: "Shamsur Rahman",
        phone: "+8801733000020",
      },
      businessName: "Padma Energy & Safe Gas Center",
      tradeLicense: "TR-RCC-2023-11208",
      division: "Rajshahi",
      district: "Rajshahi",
      upazila: "Motihar",
      address: "Station Road, Motihar, Rajshahi",
      latitude: 24.3636,
      longitude: 88.6241,
      phone: "+8801733000020",
      isCertified: true,
      rating: 4.7,
      totalReviews: 64,
      currentLpgPrice: 1460.0,
    },
    {
      userData: {
        email: "khulna.dealer@example.com",
        name: "Azizul Haque",
        phone: "+8801944000030",
      },
      businessName: "Rupsha Safe LPG Distribution",
      tradeLicense: "TR-KCC-2023-33491",
      division: "Khulna",
      district: "Khulna",
      upazila: "Boyra",
      address: "88 KDA Avenue, Boyra, Khulna",
      latitude: 22.8456,
      longitude: 89.5403,
      phone: "+8801944000030",
      isCertified: true,
      rating: 4.5,
      totalReviews: 52,
      currentLpgPrice: 1455.0,
    },
    {
      userData: {
        email: "sylhet.dealer@example.com",
        name: "Farhan Chowdhury",
        phone: "+8801755000040",
      },
      businessName: "Surma LPG & Energy Mart",
      tradeLicense: "TR-SCC-2023-77290",
      division: "Sylhet",
      district: "Sylhet",
      upazila: "Zindabazar",
      address: "East Zindabazar, Sylhet Sadar, Sylhet",
      latitude: 24.8949,
      longitude: 91.8687,
      phone: "+8801755000040",
      isCertified: true,
      rating: 4.9,
      totalReviews: 110,
      currentLpgPrice: 1445.0,
    },
    {
      userData: {
        email: "barishal.dealer@example.com",
        name: "Kamal Hossain",
        phone: "+8801866000050",
      },
      businessName: "Kirtankhola Gas Agency",
      tradeLicense: "TR-BCC-2023-88124",
      division: "Barishal",
      district: "Barishal",
      upazila: "Kotwali",
      address: "Band Road, Sadar, Barishal",
      latitude: 22.7010,
      longitude: 90.3535,
      phone: "+8801866000050",
      isCertified: false, // Pending inspection
      rating: 3.8,
      totalReviews: 28,
      currentLpgPrice: 1540.0, // Overpriced
    },
    {
      userData: {
        email: "rangpur.dealer@example.com",
        name: "Mofizur Rahman",
        phone: "+8801777000060",
      },
      businessName: "Teesta Safe Cylinder Hub",
      tradeLicense: "TR-RPCC-2023-44219",
      division: "Rangpur",
      district: "Rangpur",
      upazila: "Rangpur Sadar",
      address: "Station Road, Rangpur",
      latitude: 25.7439,
      longitude: 89.2752,
      phone: "+8801777000060",
      isCertified: true,
      rating: 4.4,
      totalReviews: 45,
      currentLpgPrice: 1465.0,
    },
    {
      userData: {
        email: "mym.dealer@example.com",
        name: "Sirajul Islam",
        phone: "+8801988000070",
      },
      businessName: "Brahmaputra LPG Center",
      tradeLicense: "TR-MCC-2023-22871",
      division: "Mymensingh",
      district: "Mymensingh",
      upazila: "Mymensingh Sadar",
      address: "Chhoto Bazar, Mymensingh Sadar, Mymensingh",
      latitude: 24.7471,
      longitude: 90.4203,
      phone: "+8801988000070",
      isCertified: true,
      rating: 4.6,
      totalReviews: 38,
      currentLpgPrice: 1450.0,
    },
  ];

  const createdDealers = [];

  for (const d of dealersData) {
    let uId = d.user?.id;
    if (!uId && d.userData) {
      const nu = await prisma.user.create({
        data: {
          email: d.userData.email,
          passwordHash: commonPasswordHash,
          name: d.userData.name,
          phone: d.userData.phone,
          role: UserRole.DEALER,
          division: d.division,
          district: d.district,
          upazila: d.upazila,
          address: d.address,
        },
      });
      uId = nu.id;
    }

    const dealer = await prisma.dealer.create({
      data: {
        userId: uId!,
        businessName: d.businessName,
        tradeLicense: d.tradeLicense,
        division: d.division,
        district: d.district,
        upazila: d.upazila,
        address: d.address,
        latitude: d.latitude,
        longitude: d.longitude,
        phone: d.phone,
        email: d.email || `${d.district.toLowerCase()}.dealer@example.com`,
        isCertified: d.isCertified,
        rating: d.rating,
        totalReviews: d.totalReviews,
        currentLpgPrice: d.currentLpgPrice,
      },
    });

    createdDealers.push(dealer);
  }

  const primaryDealer = createdDealers[0]; // Dhaka Dealer

  // 4. Create Certifications
  console.log("Creating certifications...");
  for (const dealer of createdDealers) {
    if (dealer.isCertified) {
      await prisma.certification.create({
        data: {
          certificateNumber: `CERT-LPG-${dealer.division.substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          entityType: "DEALER",
          entityId: dealer.id,
          dealerId: dealer.id,
          inspectorId: inspectorProfile.id,
          issuedAt: new Date("2024-01-15"),
          expiresAt: new Date("2027-01-15"),
          status: CertificationStatus.APPROVED,
          qrCode: `https://lpgsafe.gov.bd/certs/${dealer.id}`,
          notes: "Compliant with BDS 1530:2008 safety protocol & Explosives Act clearance.",
        },
      });
    }
  }

  // 5. Create Cylinders (Verified, Expired, Suspended)
  console.log("Creating demo cylinders...");
  const cylindersData = [
    {
      serialNumber: "LPG-BD-2026-000123",
      qrCode: "QR-OMERA-12KG-000123",
      brand: "Omera Petroleum",
      capacityKg: 12.0,
      tareWeightKg: 13.8,
      grossWeightKg: 25.8,
      manufactureDate: new Date("2023-04-10"),
      expiryDate: new Date("2033-04-10"),
      lastInspectionDate: new Date("2025-11-20"),
      nextInspectionDate: new Date("2028-11-20"),
      status: CylinderStatus.VERIFIED,
      currentDealerId: primaryDealer.id,
      safetyScore: 98.5,
      batchNumber: "OMR-BATCH-8821",
      notes: "Hydrostatic test passed with zero pressure drop. Valve seal certified.",
    },
    {
      serialNumber: "LPG-BD-2026-000124",
      qrCode: "QR-BASHUNDHARA-12KG-000124",
      brand: "Bashundhara LP Gas",
      capacityKg: 12.0,
      tareWeightKg: 14.1,
      grossWeightKg: 26.1,
      manufactureDate: new Date("2013-02-15"),
      expiryDate: new Date("2023-02-15"), // EXPIRED
      lastInspectionDate: new Date("2020-01-10"),
      nextInspectionDate: new Date("2023-01-10"),
      status: CylinderStatus.EXPIRED,
      currentDealerId: primaryDealer.id,
      safetyScore: 42.0,
      batchNumber: "BSH-BATCH-1090",
      notes: "Statutory 10-year lifespan exceeded. Requires hydro-testing & recertification.",
    },
    {
      serialNumber: "LPG-BD-2026-000125",
      qrCode: "QR-JAMUNA-12KG-000125",
      brand: "Jamuna Gas",
      capacityKg: 12.0,
      tareWeightKg: 13.9,
      grossWeightKg: 25.9,
      manufactureDate: new Date("2022-09-01"),
      expiryDate: new Date("2032-09-01"),
      lastInspectionDate: new Date("2025-08-14"),
      nextInspectionDate: new Date("2026-08-14"),
      status: CylinderStatus.SUSPENDED,
      currentDealerId: createdDealers[5].id, // Barishal dealer
      safetyScore: 28.0,
      batchNumber: "JAM-BATCH-4412",
      notes: "Suspended due to micro-leak detected around neck collar weld. Unfit for distribution.",
    },
    {
      serialNumber: "LPG-BD-2026-000126",
      qrCode: "QR-BEXIMCO-12KG-000126",
      brand: "Beximco Smart LPG",
      capacityKg: 12.0,
      tareWeightKg: 13.5,
      grossWeightKg: 25.5,
      manufactureDate: new Date("2024-01-12"),
      expiryDate: new Date("2034-01-12"),
      lastInspectionDate: new Date("2026-01-05"),
      nextInspectionDate: new Date("2029-01-05"),
      status: CylinderStatus.VERIFIED,
      currentDealerId: createdDealers[1].id, // CTG dealer
      safetyScore: 99.0,
      batchNumber: "BEX-BATCH-9901",
      notes: "Composite cylinder with smart RFID tag. Passed high-pressure burst tolerance test.",
    },
    {
      serialNumber: "LPG-BD-2026-000127",
      qrCode: "QR-TOTAL-12KG-000127",
      brand: "TotalEnergies LPG",
      capacityKg: 12.0,
      tareWeightKg: 14.0,
      grossWeightKg: 26.0,
      manufactureDate: new Date("2023-06-18"),
      expiryDate: new Date("2033-06-18"),
      lastInspectionDate: new Date("2025-10-10"),
      nextInspectionDate: new Date("2028-10-10"),
      status: CylinderStatus.VERIFIED,
      currentDealerId: createdDealers[2].id, // Rajshahi dealer
      safetyScore: 96.0,
      batchNumber: "TOT-BATCH-3310",
      notes: "Optimal condition. Meets ISO 4706 and BSTI 1530 standards.",
    },
    {
      serialNumber: "LPG-BD-2026-000128",
      qrCode: "QR-UNKNOWN-12KG-000128",
      brand: "Unmarked Gas (Counterfeit Suspect)",
      capacityKg: 12.0,
      tareWeightKg: 12.0,
      grossWeightKg: 24.0,
      manufactureDate: new Date("2020-01-01"),
      expiryDate: new Date("2025-01-01"),
      status: CylinderStatus.NOT_VERIFIED,
      safetyScore: 15.0,
      notes: "No official manufacturer stamp or batch trace found in national database.",
    },
  ];

  for (const c of cylindersData) {
    await prisma.cylinder.create({
      data: c,
    });
  }

  // 6. Create Price Records (BERC Reference vs Dealer Price)
  console.log("Creating BERC price benchmark records...");
  const bercReferencePrice12Kg = 1455.0; // BERC declared reference rate

  for (const dealer of createdDealers) {
    const isViolation = dealer.currentLpgPrice > bercReferencePrice12Kg + 50.0;
    await prisma.priceRecord.create({
      data: {
        dealerId: dealer.id,
        division: dealer.division,
        district: dealer.district,
        cylinderSizeKg: 12.0,
        reportedPrice: dealer.currentLpgPrice,
        referencePrice: bercReferencePrice12Kg,
        isViolation: isViolation,
        reportedBy: "SYSTEM_SCRAPER",
        effectiveDate: new Date(),
      },
    });
  }

  // 7. Create Inspections & Inspection Items
  console.log("Creating inspection records...");
  const inspection = await prisma.inspection.create({
    data: {
      inspectionNumber: "INSP-2026-DH-00412",
      entityType: "DEALER",
      entityId: primaryDealer.id,
      dealerId: primaryDealer.id,
      inspectorId: inspectorProfile.id,
      inspectionDate: new Date(),
      overallResult: InspectionResult.PASS,
      riskLevel: RiskLevel.LOW,
      notes: "Shop maintains proper ventilation and mandatory dry chemical fire extinguisher.",
      latitude: primaryDealer.latitude,
      longitude: primaryDealer.longitude,
      signature: "Engr. M. Hasan",
    },
  });

  const checklistItems = [
    { category: "Cylinder", itemTitle: "Condition acceptable & no corrosion", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
    { category: "Cylinder", itemTitle: "No visible denting, gouging, or weld cracks", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
    { category: "Regulator", itemTitle: "Correctly installed & approved pressure spec", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
    { category: "Rubber Tube", itemTitle: "No cracks, within expiration period", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
    { category: "Installation", itemTitle: "Upright placement with proper ventilation", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
    { category: "Storage", itemTitle: "Adequate separation distance & ABC fire extinguisher on site", result: ChecklistResult.PASS, severity: RiskLevel.LOW },
  ];

  for (const item of checklistItems) {
    await prisma.inspectionItem.create({
      data: {
        inspectionId: inspection.id,
        category: item.category,
        itemTitle: item.itemTitle,
        result: item.result,
        severity: item.severity,
      },
    });
  }

  // 8. Create Dealer Inventory
  console.log("Creating inventory...");
  await prisma.inventory.create({
    data: {
      dealerId: primaryDealer.id,
      cylinderSizeKg: 12.0,
      brand: "Omera Petroleum",
      currentStock: 48,
      minStockAlert: 15,
      status: InventoryStatus.IN_STOCK,
    },
  });

  await prisma.inventory.create({
    data: {
      dealerId: primaryDealer.id,
      cylinderSizeKg: 12.0,
      brand: "Bashundhara LP Gas",
      currentStock: 35,
      minStockAlert: 10,
      status: InventoryStatus.IN_STOCK,
    },
  });

  // 9. Create Supply Depot & Distribution Record
  console.log("Creating supply depots...");
  const depot = await prisma.supplyDepot.create({
    data: {
      name: "Chittagong Coastal LPG Terminal & Storage",
      code: "DEP-CTG-01",
      division: "Chattogram",
      district: "Chattogram",
      address: "North Patenga, Marine Drive, Chattogram",
      capacityMetricTons: 25000.0,
      currentStockMetricTons: 18450.0,
      contactPerson: "Engr. Rezaul Karim",
      contactPhone: "+8801819000111",
    },
  });

  await prisma.distributionRecord.create({
    data: {
      sourceDepotId: depot.id,
      targetDealerId: primaryDealer.id,
      batchNumber: "DIST-2026-DH-8841",
      quantity: 120,
      cylinderSizeKg: 12.0,
      dispatchDate: new Date("2026-02-28"),
      arrivalDate: new Date("2026-03-01"),
    },
  });

  // 10. Create Demo Complaint
  console.log("Creating demo complaint...");
  const complaint = await prisma.complaint.create({
    data: {
      trackingNumber: "CMP-2026-00481",
      consumerId: consumerUser.id,
      dealerId: createdDealers[5].id, // Barishal dealer
      category: ComplaintCategory.OVERPRICING,
      severity: RiskLevel.MEDIUM,
      status: ComplaintStatus.INVESTIGATION,
      location: "Band Road, Sadar, Barishal",
      description: "Dealer charged ৳1,540 for a standard 12kg cylinder when the official BERC reference rate is ৳1,455. Refused to provide a valid printed memo.",
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: complaint.id,
      updatedById: inspectorUser.id,
      status: ComplaintStatus.INVESTIGATION,
      comment: "Field officer dispatched for spot verification and pricing ledger audit.",
    },
  });

  // 11. Create Safety Articles for all 6 Categories
  console.log("Creating safety articles...");
  const safetyArticles = [
    {
      slug: "cylinder-safety-fundamentals",
      title: "Cylinder Safety: Identification, Expiry & Handling",
      category: "Cylinder Safety",
      summary: "How to check the hydrostatic test date stamp on the collar and spot unauthorized cylinder tampering.",
      content: "Always check the collar stay of the cylinder before purchase. The date is stamped in quarterly format (e.g., 'A-26' means 1st quarter of 2026). Never accept cylinders with dented walls, severe rust pitting, or tampered valves. Keep cylinders standing upright on a flat surface.",
      icon: "ShieldAlert",
      readingTimeMin: 4,
      isFeatured: true,
      orderIndex: 1,
    },
    {
      slug: "regulator-safety-guidelines",
      title: "Regulator Selection & Safe Connection Protocols",
      category: "Regulator Safety",
      summary: "Ensure BSTI and Explosives Department certified low-pressure regulators are used for domestic kitchens.",
      content: "Domestic LPG requires a low-pressure 28-30 mbar regulator. Commercial high-pressure regulators must NEVER be connected to home stoves. Always ensure the regulator switch is in the 'OFF' position before attaching or detaching from the cylinder valve.",
      icon: "Gauge",
      readingTimeMin: 3,
      isFeatured: true,
      orderIndex: 2,
    },
    {
      slug: "leak-detection-methods",
      title: "Soap Solution Leak Detection & Electronic Alarms",
      category: "Leak Detection",
      summary: "The certified safe way to test for gas leaks. Why you must NEVER use a lighter or open flame to check for leaks.",
      content: "Apply a concentrated soap-water solution with a sponge around the valve neck, regulator coupling, and hose ends. If bubbles form and expand, there is an active gas leak. Never, under any circumstances, use a matchstick or lighter to search for a leak. If you smell ethyl mercaptan (the pungent sulfur odor added to LPG), immediately turn off the regulator, open all windows and doors, avoid touching electrical switches, and evacuate.",
      icon: "Activity",
      readingTimeMin: 5,
      isFeatured: true,
      orderIndex: 3,
    },
    {
      slug: "safe-cylinder-storage",
      title: "Storage Best Practices: Ventilation & Thermal Limits",
      category: "Storage",
      summary: "Prevent heat exposure and hazardous gas pooling with proper cylinder placement.",
      content: "LPG is heavier than air (density ratio ~1.5 to 2.0). In case of a leak, it pools along the floor and basement drains rather than rising. Store cylinders in well-ventilated ground-level areas away from direct sunlight, open electrical wiring, and open flames. Never store spare cylinders in closed cupboards or underground basements.",
      icon: "Box",
      readingTimeMin: 3,
      isFeatured: false,
      orderIndex: 4,
    },
    {
      slug: "proper-stove-installation",
      title: "Safe Installation: Hose Specifications & Distances",
      category: "Installation",
      summary: "Maintain mandatory clearances between burner flames and LPG cylinders.",
      content: "The LPG cylinder must stand at least 1 meter away horizontally from the cooking stove burner. Use steel-wire reinforced orange rubber hose (IS 9573 or BSTI equivalent). Replace rubber hoses every 2 to 3 years regardless of visible condition.",
      icon: "Wrench",
      readingTimeMin: 4,
      isFeatured: false,
      orderIndex: 5,
    },
    {
      slug: "emergency-response-protocol",
      title: "Emergency Response & National Rescue Hotlines",
      category: "Emergency Response",
      summary: "Actionable evacuation sequence during fire or severe gas leaks. Key Bangladesh emergency contacts.",
      content: "If a gas leak or fire occurs: 1. Do NOT switch on or off any electric lights, fans, or appliances (spark can ignite the vapor cloud). 2. Turn regulator knob to OFF if safely accessible. 3. Extinguish all nearby open flames or incense. 4. Open doors and windows for natural ventilation. 5. Evacuate everyone from the building. 6. Call National Emergency 999 or Bangladesh Fire Service 16163 from outside the danger zone.",
      icon: "PhoneCall",
      readingTimeMin: 4,
      isFeatured: true,
      orderIndex: 6,
    },
  ];

  for (const article of safetyArticles) {
    await prisma.safetyArticle.create({
      data: article,
    });
  }

  // 12. Create Safety Standards
  console.log("Creating safety standards...");
  await prisma.safetyStandard.create({
    data: {
      code: "BDS 1530:2008",
      title: "Specification for Welded Low Carbon Steel Gas Cylinders for LPG",
      regulatoryBody: "BSTI & Department of Explosives",
      category: "Cylinder Manufacturing & Testing",
      description: "Mandatory standard for burst pressure tolerance, metallurgy, wall thickness, and periodic hydraulic testing.",
      requirementsText: "Hydrostatic test pressure must reach 2.5 MPa with zero residual deformation. Mandatory re-testing every 5 years after the initial 10-year lifespan.",
      isMandatory: true,
      effectiveYear: 2008,
    },
  });

  await prisma.safetyStandard.create({
    data: {
      code: "Gas Cylinder Rules 1991",
      title: "The Gas Cylinders Rules 1991 (Under Explosives Act 1884)",
      regulatoryBody: "Department of Explosives, Govt. of Bangladesh",
      category: "Storage, Handling & Transport",
      description: "Governs licensing of storage depots, transportation safety, valve caps, and dealer certification guidelines.",
      requirementsText: "All retail storage over 80kg LPG capacity must hold a valid Chief Inspector of Explosives license.",
      isMandatory: true,
      effectiveYear: 1991,
    },
  });

  // 13. Create Demo IoT Device & Leakage Alert
  console.log("Creating IoT simulation telemetry...");
  const iotDevice = await prisma.ioTDevice.create({
    data: {
      deviceSerial: "IOT-SENS-DH-001",
      dealerId: primaryDealer.id,
      consumerId: consumerUser.id,
      deviceName: "Kitchen Gas & Temp Sensor #001",
      locationDescription: "Main Kitchen Cylinder Bay - Dhanmondi",
      status: DeviceStatus.ONLINE,
      batteryLevel: 92,
      gasLevelPpm: 18.4,
      temperatureC: 27.5,
      lastHeartbeat: new Date(),
    },
  });

  // 14. Create Demo System Notification
  await prisma.notification.create({
    data: {
      userId: consumerUser.id,
      title: "Welcome to LPGSafe Bangladesh",
      message: "Your consumer account is active. You can now verify cylinder authenticity and report fair price violations.",
      type: "SYSTEM",
      isRead: false,
      linkUrl: "/verify",
    },
  });

  // 15. Create AI Models Registry & Sample Alerts
  console.log("Registering AI Models & Initial Safety Alerts...");
  await prisma.aIModel.createMany({
    data: [
      {
        modelKey: "safety_risk_model",
        name: "Dealer Safety Risk Predictor",
        algorithm: "XGBoost Classifier",
        version: "1.2.0",
        task: "binary_classification",
        status: AIModelStatus.ACTIVE,
        datasetSize: 10000,
        trainingDate: new Date(),
        metricsJson: JSON.stringify({
          f1_score: 0.884,
          precision: 0.862,
          recall: 0.908,
          roc_auc: 0.941,
          dataset: "SYNTHETIC_DATASET_10K",
        }),
        artifactPath: "ml/models/safety_risk_model.joblib",
        notes: "Best model trained on 10,000 synthetic Bangladesh safety inspection records.",
      },
      {
        modelKey: "price_anomaly_model",
        name: "LPG Fair Price Anomaly Detector",
        algorithm: "Isolation Forest",
        version: "1.1.0",
        task: "anomaly_detection",
        status: AIModelStatus.ACTIVE,
        datasetSize: 20000,
        trainingDate: new Date(),
        metricsJson: JSON.stringify({
          anomaly_rate: 0.048,
          precision: 0.895,
          recall: 0.871,
          dataset: "SYNTHETIC_PRICES_20K",
        }),
        artifactPath: "ml/models/price_anomaly_model.joblib",
        notes: "Trained on regional BERC price observations with seasonal and district baselines.",
      },
      {
        modelKey: "demand_forecast_model",
        name: "Regional LPG Demand Forecaster",
        algorithm: "XGBoost Regressor",
        version: "1.0.4",
        task: "regression",
        status: AIModelStatus.ACTIVE,
        datasetSize: 5000,
        trainingDate: new Date(),
        metricsJson: JSON.stringify({
          mae: 142.5,
          rmse: 189.2,
          r2_score: 0.912,
          dataset: "SYNTHETIC_DEMAND_5K",
        }),
        artifactPath: "ml/models/demand_forecast_model.joblib",
        notes: "Predicts weekly cylinder demand by division and district for proactive supply chain dispatch.",
      },
      {
        modelKey: "complaint_classifier",
        name: "Safety Complaint Triage Classifier",
        algorithm: "TF-IDF + Logistic Regression",
        version: "1.3.0",
        task: "multiclass_classification",
        status: AIModelStatus.ACTIVE,
        datasetSize: 3000,
        trainingDate: new Date(),
        metricsJson: JSON.stringify({
          f1_macro: 0.867,
          accuracy: 0.874,
          dataset: "SYNTHETIC_COMPLAINTS_3K",
        }),
        artifactPath: "ml/models/complaint_classifier.joblib",
        notes: "Categorizes inbound consumer complaints (overcharging, leakage, defective valve, unauthorized refilling).",
      },
    ],
  });

  // Sample AI Alerts
  await prisma.aIAlert.createMany({
    data: [
      {
        type: AIAlertType.HIGH_RISK_DEALER,
        title: "High Safety Risk Detected — Gulshan LPG Hub",
        description: "Safety risk score 84/100 triggered by repeated failed rubber tube checks and close proximity to residential sector.",
        entityType: "DEALER",
        entityId: primaryDealer.id,
        severity: RiskLevel.HIGH,
        isResolved: false,
      },
      {
        type: AIAlertType.PRICE_ANOMALY,
        title: "BERC Price Gouging Anomaly — Mirpur Retailers",
        description: "Retail LPG 12kg observed at ৳1,650 (৳195 above BERC ceiling ৳1,455). Flagged for administrative audit.",
        entityType: "PRICE_RECORD",
        entityId: "price-anom-001",
        severity: RiskLevel.MEDIUM,
        isResolved: false,
      },
      {
        type: AIAlertType.DEMAND_SHORTAGE,
        title: "Projected Cylinder Shortage — Sylhet Division",
        description: "AI demand forecasting projects a 28% supply deficit in Sylhet over the next 14 days due to seasonal tea garden demand spikes.",
        entityType: "DISTRICT",
        entityId: "Sylhet",
        severity: RiskLevel.MEDIUM,
        isResolved: false,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("Demo Accounts:");
  console.log("  CONSUMER:  consumer@example.com   / SafePass123!");
  console.log("  DEALER:    dealer@example.com     / SafePass123!");
  console.log("  INSPECTOR: inspector@example.com  / SafePass123!");
  console.log("  ADMIN:     admin@example.com      / SafePass123!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
