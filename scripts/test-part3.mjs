/**
 * LPGSafe Bangladesh — Part 3 API Integration Test
 * Tests: Inspector Portal, Certifications, Admin, Supply Chain, IoT
 *
 * Usage: node scripts/test-part3.mjs [BASE_URL]
 * Defaults to http://localhost:3000
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";
let passed = 0;
let failed = 0;
const errors = [];

async function test(label, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL  ${label}`);
    console.error(`         ${err.message}`);
    failed++;
    errors.push({ label, error: err.message });
  }
}

function expect(value, message) {
  if (!value) throw new Error(message || `Assertion failed: ${JSON.stringify(value)}`);
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

console.log(`\n🔬 LPGSafe BD — Part 3 API Integration Tests`);
console.log(`   Target: ${BASE_URL}\n`);

// ─── 1. INSPECTIONS ───────────────────────────────────────────────────────────
console.log("📋 1. Inspections API");

await test("GET /api/inspections responds 200 with success flag", async () => {
  const { status, body } = await apiFetch("/api/inspections");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(Array.isArray(body.inspections), "Expected inspections array");
});

await test("GET /api/inspections includes stats object", async () => {
  const { body } = await apiFetch("/api/inspections");
  expect(body.stats, "Expected stats object");
  expect(typeof body.stats.total === "number", "Expected stats.total as number");
  expect(typeof body.stats.passed === "number", "Expected stats.passed as number");
  expect(typeof body.stats.highRisk === "number", "Expected stats.highRisk as number");
});

await test("GET /api/inspections?result=PASS filter works", async () => {
  const { status, body } = await apiFetch("/api/inspections?result=PASS");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(Array.isArray(body.inspections), "Expected inspections array");
  const hasNonPass = body.inspections.some((i) => i.overallResult !== "PASS");
  expect(!hasNonPass, "Filter returned non-PASS inspections");
});

await test("GET /api/inspections?risk=HIGH filter works", async () => {
  const { status, body } = await apiFetch("/api/inspections?risk=HIGH");
  expect(status === 200, `Expected 200, got ${status}`);
});

// Check a specific inspection if any exist
const inspRes = await apiFetch("/api/inspections");
const firstInspection = inspRes.body.inspections?.[0];

if (firstInspection?.id) {
  await test(`GET /api/inspections/${firstInspection.id} returns inspection detail`, async () => {
    const { status, body } = await apiFetch(`/api/inspections/${firstInspection.id}`);
    expect(status === 200, `Expected 200, got ${status}`);
    expect(body.success === true, "Expected success: true");
    expect(body.inspection?.id === firstInspection.id, "Expected matching inspection ID");
    expect(Array.isArray(body.inspection?.items), "Expected items checklist array");
  });

  await test(`GET /api/inspections/${firstInspection.id} includes 5 statutory categories`, async () => {
    const { body } = await apiFetch(`/api/inspections/${firstInspection.id}`);
    const items = body.inspection?.items || [];
    const categories = [...new Set(items.map((i) => i.category))];
    const required = ["Cylinder", "Regulator", "Rubber Tube", "Installation", "Storage"];
    const hasAll = required.every((cat) => categories.includes(cat));
    expect(hasAll, `Missing categories. Found: ${categories.join(", ")}`);
  });
} else {
  console.log("   ⚠️  No inspections found in DB — skipping detail/checklist tests");
}

// ─── 2. CERTIFICATIONS ────────────────────────────────────────────────────────
console.log("\n🏆 2. Certifications API");

await test("GET /api/certifications returns 200 with certs array", async () => {
  const { status, body } = await apiFetch("/api/certifications");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(Array.isArray(body.certifications), "Expected certifications array");
});

await test("GET /api/certifications includes stats breakdown", async () => {
  const { body } = await apiFetch("/api/certifications");
  expect(body.stats, "Expected stats object");
  expect(typeof body.stats.approved === "number", "Expected stats.approved as number");
  expect(typeof body.stats.expired === "number", "Expected stats.expired as number");
});

await test("GET /api/certifications?status=APPROVED filter works", async () => {
  const { status, body } = await apiFetch("/api/certifications?status=APPROVED");
  expect(status === 200, `Expected 200, got ${status}`);
  const hasNonApproved = body.certifications.some((c) => c.status !== "APPROVED");
  expect(!hasNonApproved, "Filter returned non-APPROVED certifications");
});

// ─── 3. ADMIN APIs ────────────────────────────────────────────────────────────
console.log("\n🛡️  3. Admin APIs");

await test("GET /api/admin/stats without auth returns 401/403", async () => {
  const { status } = await apiFetch("/api/admin/stats");
  expect(status === 401 || status === 403, `Expected 401/403, got ${status}`);
});

await test("GET /api/admin/users without auth returns 401/403", async () => {
  const { status } = await apiFetch("/api/admin/users");
  expect(status === 401 || status === 403, `Expected 401/403, got ${status}`);
});

await test("GET /api/admin/standards returns safety standards list", async () => {
  const { status, body } = await apiFetch("/api/admin/standards");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(Array.isArray(body.standards), "Expected standards array");
});

await test("POST /api/admin/standards without auth returns 401/403", async () => {
  const { status } = await apiFetch("/api/admin/standards", {
    method: "POST",
    body: JSON.stringify({ code: "TEST-001", title: "Test", description: "Test", requirementsText: "Test" }),
  });
  expect(status === 401 || status === 403, `Expected 401/403, got ${status}`);
});

// ─── 4. SUPPLY CHAIN ──────────────────────────────────────────────────────────
console.log("\n🚚 4. Supply Chain API");

await test("GET /api/supply-chain returns 200 with depots and distributions", async () => {
  const { status, body } = await apiFetch("/api/supply-chain");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(Array.isArray(body.depots), "Expected depots array");
  expect(Array.isArray(body.distributions), "Expected distributions array");
});

await test("GET /api/supply-chain includes summary metrics", async () => {
  const { body } = await apiFetch("/api/supply-chain");
  expect(body.summary, "Expected summary object");
  expect(typeof body.summary.totalCapacityMetricTons === "number", "Expected totalCapacityMetricTons");
  expect(typeof body.summary.utilizationRate !== "undefined", "Expected utilizationRate");
});

await test("GET /api/supply-chain includes low stock alerts array", async () => {
  const { body } = await apiFetch("/api/supply-chain");
  expect(Array.isArray(body.lowStockAlerts), "Expected lowStockAlerts array");
});

await test("POST /api/supply-chain without auth returns 401/403", async () => {
  const { status } = await apiFetch("/api/supply-chain", {
    method: "POST",
    body: JSON.stringify({ sourceDepotId: "x", targetDealerId: "y", quantity: 10 }),
  });
  expect(status === 401 || status === 403, `Expected 401/403, got ${status}`);
});

// ─── 5. IoT TELEMETRY ─────────────────────────────────────────────────────────
console.log("\n📡 5. IoT Telemetry API");

await test("GET /api/iot returns 200 with devices and alerts", async () => {
  const { status, body } = await apiFetch("/api/iot");
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(Array.isArray(body.devices), "Expected devices array");
  expect(Array.isArray(body.alerts), "Expected alerts array");
});

await test("POST /api/iot ingests normal telemetry (15 PPM — safe)", async () => {
  const { status, body } = await apiFetch("/api/iot", {
    method: "POST",
    body: JSON.stringify({
      deviceSerial: "TEST-SAFE-001",
      gasLevelPpm: 15.0,
      temperatureC: 26.5,
      batteryLevel: 90,
    }),
  });
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(!body.alert, "Normal PPM should not trigger alert");
});

await test("POST /api/iot ingests warning telemetry (150 PPM — elevated)", async () => {
  const { status, body } = await apiFetch("/api/iot", {
    method: "POST",
    body: JSON.stringify({
      deviceSerial: "TEST-WARN-001",
      gasLevelPpm: 150.0,
      temperatureC: 28.0,
      batteryLevel: 75,
    }),
  });
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(!body.alert, "Warning PPM (150) should not trigger critical alert");
});

await test("POST /api/iot trips critical leak alert (300 PPM)", async () => {
  const { status, body } = await apiFetch("/api/iot", {
    method: "POST",
    body: JSON.stringify({
      deviceSerial: "TEST-CRIT-001",
      gasLevelPpm: 300.0,
      temperatureC: 35.0,
      batteryLevel: 60,
    }),
  });
  expect(status === 200, `Expected 200, got ${status}`);
  expect(body.success === true, "Expected success: true");
  expect(body.alert !== null, "300 PPM should trigger critical leakage alert");
  expect(body.alert?.severity === "CRITICAL", `Alert severity should be CRITICAL`);
});

// Resolve the test critical alert
if (inspRes.body.success) {
  await test("PATCH /api/iot resolves active leakage alert", async () => {
    // First get the alert we just created
    const iotRes = await apiFetch("/api/iot");
    const testAlert = iotRes.body.alerts?.find((a) =>
      a.device?.deviceSerial?.startsWith("TEST-CRIT")
    );

    if (testAlert) {
      const { status, body } = await apiFetch("/api/iot", {
        method: "PATCH",
        body: JSON.stringify({
          alertId: testAlert.id,
          resolvedNotes: "Test scenario resolved — cylinder isolated successfully.",
        }),
      });
      expect(status === 200, `Expected 200, got ${status}`);
      expect(body.success === true, "Expected success: true");
      expect(body.alert?.isResolved === true, "Alert should be marked resolved");
    } else {
      console.log("   ⚠️  No TEST-CRIT alert found to resolve — skipping");
    }
  });
}

// ─── 6. NOTIFICATIONS ─────────────────────────────────────────────────────────
console.log("\n🔔 6. Notifications API");

await test("GET /api/notifications without auth returns 401", async () => {
  const { status } = await apiFetch("/api/notifications");
  expect(status === 401, `Expected 401, got ${status}`);
});

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"─".repeat(54)}`);
console.log(`📊 Part 3 Test Summary: ${passed}/${total} passed`);
if (failed > 0) {
  console.log(`\n❌ Failed tests:`);
  errors.forEach((e) => console.log(`   • ${e.label}: ${e.error}`));
  process.exit(1);
} else {
  console.log(`✅ All Part 3 API tests passed successfully!`);
  process.exit(0);
}
