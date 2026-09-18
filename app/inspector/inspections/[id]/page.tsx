"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Camera,
  Upload,
  UserCheck,
  FileCheck,
  Building,
  MapPin,
  Calendar,
  Save,
  CheckSquare,
  HelpCircle,
  Brain,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function DigitalInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params?.id as string;

  const [inspection, setInspection] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [overallResult, setOverallResult] = useState<"PASS" | "FAIL" | "CONDITIONAL">("PASS");
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [generalNotes, setGeneralNotes] = useState("");
  const [signature, setSignature] = useState("Engr. Mahmudul Hasan");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  // AI Risk Assessment state
  const [aiPrediction, setAiPrediction] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;

    fetch(`/api/inspections/${inspectionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.inspection) {
          setInspection(data.inspection);
          setChecklist(data.inspection.items || []);
          setOverallResult(data.inspection.overallResult || "PASS");
          setRiskLevel(data.inspection.riskLevel || "LOW");
          setGeneralNotes(data.inspection.notes || "");
          if (data.inspection.signature) setSignature(data.inspection.signature);
          if (data.inspection.evidencePhotoUrl) setPhotoPreview(data.inspection.evidencePhotoUrl);
        }
      })
      .catch((err) => console.error("Error loading inspection:", err))
      .finally(() => setIsLoading(false));
  }, [inspectionId]);

  const handleItemResultChange = (itemId: string, result: "PASS" | "FAIL" | "NOT_APPLICABLE") => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, result } : item))
    );

    // Auto-recalculate risk if any fails exist
    setTimeout(() => {
      const currentFails = checklist.filter((i) =>
        i.id === itemId ? result === "FAIL" : i.result === "FAIL"
      ).length;

      if (currentFails >= 3) {
        setRiskLevel("CRITICAL");
        setOverallResult("FAIL");
      } else if (currentFails >= 1) {
        setRiskLevel("HIGH");
        setOverallResult("CONDITIONAL");
      } else {
        setRiskLevel("LOW");
        setOverallResult("PASS");
      }
    }, 50);
  };

  const handleItemNotesChange = (itemId: string, notes: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be 5MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionSuccess(null);

    try {
      const res = await fetch(`/api/inspections/${inspectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallResult,
          riskLevel,
          notes: generalNotes,
          signature,
          evidencePhotoUrl: photoPreview,
          items: checklist,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess(data.message);

        // Trigger AI risk assessment (non-blocking, fire-and-forget with display)
        if (inspection?.dealerId) {
          setIsAiLoading(true);
          const failCount = checklist.filter((i) => i.result === "FAIL").length;
          const leakageItem = checklist.find((i) =>
            i.itemTitle?.toLowerCase().includes("leak") ||
            i.category?.toLowerCase() === "rubber tube"
          );
          fetch("/api/ai/predict/safety-risk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dealerId: inspection.dealerId,
              inspection_failures: failCount,
              previous_violations: 0,
              complaints_last_90_days: 0,
              leakage_complaints: leakageItem?.result === "FAIL" ? 1 : 0,
              certification_expired:
                inspection.dealer?.certifications?.length === 0 ? 1 : 0,
              cylinder_age_days: 365,
              regulator_condition_enc:
                checklist.find((i) => i.category === "Regulator")?.result === "FAIL" ? 2 : 0,
              tube_condition_enc:
                leakageItem?.result === "FAIL" ? 2 : 0,
              installation_ok:
                checklist.find((i) => i.category === "Installation")?.result !== "FAIL" ? 1 : 0,
              storage_ok:
                checklist.find((i) => i.category === "Storage")?.result !== "FAIL" ? 1 : 0,
              ventilation_ok: 1,
              fire_equipment: 1,
              days_since_inspection: 30,
            }),
          })
            .then((r) => r.json())
            .then((aiData) => {
              if (aiData.success && aiData.prediction) {
                setAiPrediction(aiData.prediction);
              }
            })
            .catch(() => {})
            .finally(() => setIsAiLoading(false));
        }

        setTimeout(() => {
          router.push("/inspector/dashboard");
        }, 6000);
      } else {
        alert(data.error || "Failed to submit audit report.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error connecting to inspection service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-3 text-xs text-slate-500">Loading statutory inspection checklist...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy-950">Inspection Record Not Found</h2>
        <Link href="/inspector/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Group checklist items by category
  const categories = ["Cylinder", "Regulator", "Rubber Tube", "Installation", "Storage"];
  const groupedChecklist: Record<string, any[]> = {};
  categories.forEach((cat) => {
    groupedChecklist[cat] = checklist.filter((item) => item.category === cat);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/inspector/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inspection Hub
          </Link>
          <div className="text-xs font-mono text-slate-400">
            Form: EXP-F-1530-REV2
          </div>
        </div>

        {/* Audit Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="warning" className="text-[10px] font-bold">
                  STATUTORY FIELD AUDIT
                </Badge>
                <span className="text-xs font-mono font-bold text-navy-950">
                  {inspection.inspectionNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
                {inspection.dealer?.businessName}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {inspection.dealer?.address}, {inspection.dealer?.upazila || inspection.dealer?.district},{" "}
                {inspection.dealer?.division}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Date</span>
              <span className="text-xs font-bold text-navy-950">
                {formatDate(inspection.inspectionDate)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Trade Lic: {inspection.dealer?.tradeLicense || "TR-GOV-2024"}
              </span>
            </div>
          </div>

          {submissionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{submissionSuccess} Redirecting to inspection hub...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 5 Checklist Groups */}
            <div className="space-y-6">
              {categories.map((cat, idx) => {
                const items = groupedChecklist[cat] || [];
                if (items.length === 0) return null;

                return (
                  <div
                    key={cat}
                    className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-navy-950 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-black text-sm text-navy-950 tracking-tight">
                          {cat} Compliance Checklist
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        BSTI BDS 1530:2008 & Explosives Rules
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 max-w-xl">
                            <h4 className="font-bold text-xs text-navy-950">{item.itemTitle}</h4>
                            <input
                              type="text"
                              placeholder="Add notes / findings (optional)..."
                              value={item.notes || ""}
                              onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-navy-950"
                            />
                          </div>

                          {/* 3 Result Toggle Buttons */}
                          <div className="flex items-center gap-1.5 self-start md:self-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleItemResultChange(item.id, "PASS")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                item.result === "PASS"
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemResultChange(item.id, "FAIL")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                item.result === "FAIL"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              Fail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemResultChange(item.id, "NOT_APPLICABLE")}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                item.result === "NOT_APPLICABLE"
                                  ? "bg-slate-700 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              N/A
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment, Evidence & Risk Scoring Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-navy-950 uppercase tracking-wider pb-2 border-b border-slate-100">
                Auditor Assessment & Statutory Risk Classification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Result */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Overall Statutory Clearance Result
                  </label>
                  <select
                    value={overallResult}
                    onChange={(e: any) => setOverallResult(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-navy-950 bg-white"
                  >
                    <option value="PASS">PASS — Compliant with Safety Standard</option>
                    <option value="CONDITIONAL">CONDITIONAL — 14-Day Remediation Period</option>
                    <option value="FAIL">FAIL — Safety Violations Recorded (Revoke License)</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Assigned Fire & Explosion Risk Level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e: any) => setRiskLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-navy-950 bg-white"
                  >
                    <option value="LOW">LOW — Routine Periodic Oversight</option>
                    <option value="MEDIUM">MEDIUM — Minor Storage Irregularities</option>
                    <option value="HIGH">HIGH — Critical Distance / Flammability Hazard</option>
                    <option value="CRITICAL">CRITICAL — Immediate Evacuation & Seizure</option>
                  </select>
                </div>
              </div>

              {/* Inspector General Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Inspection Summary Notes & Enforcement Order
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={3}
                  placeholder="Record summary observations, valve conditions, customer safety instructions issued..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                />
              </div>

              {/* Photo Upload & Evidence */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Photographic Evidence & Site Verification Photo
                </label>
                {photoError && <p className="text-xs text-rose-600 mb-2">{photoError}</p>}
                
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload Site Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {photoPreview && (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-300">
                      <img
                        src={photoPreview}
                        alt="Audit Evidence"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview(null)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Signature */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Inspector Electronic Signature / Badge Clearance
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter full officer name & badge"
                    className="max-w-md h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-navy-950"
                  />
                  <Badge variant="neutral" className="text-[10px]">
                    EXP-ENFORCE-AUTH
                  </Badge>
                </div>
              </div>
            </div>


            {/* AI Risk Assessment Panel */}
            {(isAiLoading || aiPrediction) && (
              <div className={`rounded-2xl border p-4 ${
                aiPrediction?.risk_level === "CRITICAL" ? "border-red-300 bg-red-50" :
                aiPrediction?.risk_level === "HIGH"     ? "border-orange-200 bg-orange-50" :
                aiPrediction?.risk_level === "MEDIUM"   ? "border-yellow-200 bg-yellow-50" :
                "border-emerald-200 bg-emerald-50"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold text-slate-900 text-sm">AI Risk Assessment</span>
                  <Badge className="text-xs bg-blue-100 text-blue-700 border-0">Decision Support Only</Badge>
                </div>
                {isAiLoading && !aiPrediction ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-violet-300 border-t-violet-600" />
                    Running AI safety risk model…
                  </div>
                ) : aiPrediction ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-black ${
                          aiPrediction.risk_level === "CRITICAL" ? "text-red-600" :
                          aiPrediction.risk_level === "HIGH"     ? "text-orange-600" :
                          aiPrediction.risk_level === "MEDIUM"   ? "text-yellow-600" :
                          "text-emerald-600"
                        }`}>{aiPrediction.risk_score}</div>
                        <div className="text-xs text-slate-400">/100</div>
                      </div>
                      <div>
                        <Badge className={`text-xs border-0 font-bold mb-1 ${
                          aiPrediction.risk_level === "CRITICAL" ? "bg-red-200 text-red-800" :
                          aiPrediction.risk_level === "HIGH"     ? "bg-orange-200 text-orange-800" :
                          aiPrediction.risk_level === "MEDIUM"   ? "bg-yellow-200 text-yellow-800" :
                          "bg-emerald-200 text-emerald-800"
                        }`}>{aiPrediction.risk_level} RISK</Badge>
                        <p className="text-xs text-slate-600">{aiPrediction.recommended_action}</p>
                      </div>
                    </div>
                    {aiPrediction.contributing_factors?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Contributing Factors:</p>
                        <ul className="space-y-1">
                          {aiPrediction.contributing_factors.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <Zap className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2">
                      <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-500">AI prediction uses synthetic training data. Human review required before any regulatory action.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Submission CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link href="/inspector/dashboard">
                <Button type="button" variant="outline" size="sm">
                  Cancel & Exit
                </Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-navy-950 hover:bg-navy-900 text-white font-bold gap-2 shadow-md"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                {isSubmitting ? "Submitting Official Audit..." : "Submit Digital Audit & Sync Certification"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
