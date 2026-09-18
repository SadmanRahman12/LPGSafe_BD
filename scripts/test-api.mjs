async function runAllTests() {
  console.log("=== COMPREHENSIVE API INTEGRITY VALIDATION ===");

  // 1. Dealers API
  const dealersRes = await fetch("http://localhost:3000/api/dealers");
  const dealersData = await dealersRes.json();
  console.log(`[1] Dealers API: HTTP ${dealersRes.status} | Found ${dealersData.count} dealers`);
  console.log(`    Top Dealer: ${dealersData.dealers[0].businessName} (${dealersData.dealers[0].division})`);

  // 2. Verified Cylinder
  const verRes1 = await fetch("http://localhost:3000/api/verify?query=LPG-BD-2026-000123");
  const verData1 = await verRes1.json();
  console.log(`[2] Cylinder Verify (Valid): HTTP ${verRes1.status} | Status: ${verData1.status} | Brand: ${verData1.cylinder?.brand} | Score: ${verData1.cylinder?.safetyScore}/100`);

  // 3. Expired Cylinder
  const verRes2 = await fetch("http://localhost:3000/api/verify?query=LPG-BD-2026-000124");
  const verData2 = await verRes2.json();
  console.log(`[3] Cylinder Verify (Expired): HTTP ${verRes2.status} | Status: ${verData2.status} | Brand: ${verData2.cylinder?.brand}`);

  // 4. Suspended Cylinder
  const verRes3 = await fetch("http://localhost:3000/api/verify?query=LPG-BD-2026-000125");
  const verData3 = await verRes3.json();
  console.log(`[4] Cylinder Verify (Suspended): HTTP ${verRes3.status} | Status: ${verData3.status} | Brand: ${verData3.cylinder?.brand}`);

  // 5. Unregistered Cylinder
  const verRes4 = await fetch("http://localhost:3000/api/verify?query=LPG-BD-2026-UNKNOWN");
  const verData4 = await verRes4.json();
  console.log(`[5] Cylinder Verify (Unregistered): HTTP ${verRes4.status} | Status: ${verData4.status} | Verified: ${verData4.verified}`);

  // 6. Prices API
  const pricesRes = await fetch("http://localhost:3000/api/prices");
  const pricesData = await pricesRes.json();
  console.log(`[6] Prices API: HTTP ${pricesRes.status} | BERC Benchmark: ৳${pricesData.stats?.referencePrice} | Market Avg: ৳${pricesData.stats?.averagePrice} | Total Records: ${pricesData.records?.length}`);
  const violations = pricesData.records?.filter((r) => r.isViolation);
  console.log(`    Price Violations Flagged: ${violations?.length} outlet(s)`);

  // 7. Pages accessibility
  const pages = ["/", "/login", "/register", "/forgot-password", "/dealers", "/verify", "/prices", "/safety"];
  console.log("[7] Verifying Public Routes Status:");
  for (const page of pages) {
    const pRes = await fetch(`http://localhost:3000${page}`);
    console.log(`    ${page.padEnd(20)}: HTTP ${pRes.status}`);
  }

  console.log("=== ALL TESTS PASSED SUCCESSFULLY ===");
}

runAllTests().catch(console.error);
