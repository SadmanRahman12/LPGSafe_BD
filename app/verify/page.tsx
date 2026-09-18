"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  QrCode,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  Scale,
  Camera,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [serialInput, setSerialInput] = useState(initialId);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (initialId) {
      performVerification(initialId);
    }
  }, [initialId]);

  const performVerification = async (queryId: string) => {
    if (!queryId.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?query=${encodeURIComponent(queryId.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      setResult({
        success: false,
        message: "Failed to connect to verification server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(serialInput);
  };

  const setSample = (id: string) => {
    setSerialInput(id);
    performVerification(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge variant="safe" className="px-3 py-1 text-sm font-bold">
            <ShieldCheck className="w-4 h-4 mr-1" />
            VERIFIED — SAFE FOR USE
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="danger" className="px-3 py-1 text-sm font-bold">
            <ShieldX className="w-4 h-4 mr-1" />
            EXPIRED — HYDRO-TEST OVERDUE
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="warning" className="px-3 py-1 text-sm font-bold">
            <ShieldAlert className="w-4 h-4 mr-1" />
            SUSPENDED — RECALL NOTICE
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="px-3 py-1 text-sm font-bold">
            <HelpCircle className="w-4 h-4 mr-1" />
            NOT VERIFIED — UNREGISTERED
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>National Cylinder Registry Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
          Verify Cylinder Authenticity & Safety
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Enter the serial number stamped on the cylinder stay collar or scan the QR code to check statutory inspection dates, manufacturer credentials, and recall status.
        </p>
      </div>

      {/* Verification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg shadow-slate-200/50 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                placeholder="e.g. LPG-BD-2026-000123"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 text-base font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-navy-950 focus:ring-2 focus:ring-navy-950/10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCameraActive(!cameraActive)}
                className="gap-2 border-slate-300"
                title="Simulate Camera Scanner"
              >
                <Camera className="w-5 h-5 text-slate-700" />
                <span className="hidden sm:inline">Scan QR</span>
              </Button>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="bg-navy-950 hover:bg-navy-900 text-white font-semibold px-8"
              >
                Verify Now
              </Button>
            </div>
          </div>
        </form>

        {/* Camera Scanner Simulation */}
        {cameraActive && (
          <div className="mt-6 p-6 rounded-xl bg-slate-950 text-white text-center space-y-4 animate-in fade-in">
            <div className="relative mx-auto w-48 h-48 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center bg-slate-900/60 overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 animate-bounce" />
              <QrCode className="w-16 h-16 text-emerald-400/50" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Simulated QR Code Scanner Active
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Point camera at the cylinder QR sticker, or click sample code below
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSerialInput("LPG-BD-2026-000123");
                setCameraActive(false);
                performVerification("LPG-BD-2026-000123");
              }}
              className="bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700 text-xs"
            >
              Scan Demo Cylinder (LPG-BD-2026-000123)
            </Button>
          </div>
        )}

        {/* Quick Demo Test Chips */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Try Demo Cylinders:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSample("LPG-BD-2026-000123")}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold hover:bg-emerald-100 transition-colors"
            >
              LPG-BD-2026-000123 (Verified)
            </button>
            <button
              type="button"
              onClick={() => setSample("LPG-BD-2026-000124")}
              className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-mono font-semibold hover:bg-red-100 transition-colors"
            >
              LPG-BD-2026-000124 (Expired)
            </button>
            <button
              type="button"
              onClick={() => setSample("LPG-BD-2026-000125")}
              className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-mono font-semibold hover:bg-amber-100 transition-colors"
            >
              LPG-BD-2026-000125 (Suspended)
            </button>
            <button
              type="button"
              onClick={() => setSample("LPG-BD-2026-000128")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 text-xs font-mono font-semibold hover:bg-slate-200 transition-colors"
            >
              LPG-BD-2026-000128 (Unregistered)
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                National Database Result
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-mono font-black text-navy-950">
                  {result.cylinder?.serialNumber || result.queriedId || serialInput}
                </h2>
              </div>
            </div>
            <div>{getStatusBadge(result.status)}</div>
          </div>

          {/* If NOT_VERIFIED */}
          {result.status === "NOT_VERIFIED" && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-navy-950">
                    Unverified Cylinder Warning
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {result.message ||
                      "This serial code was not found in the national verified database. It may be a counterfeit cylinder, an unapproved grey-market import, or illegally cross-decanted."}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/dealers">
                  <Button size="sm" variant="primary" className="bg-navy-950 text-xs">
                    Locate an Authorized Certified Dealer
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* If cylinder exists (VERIFIED, EXPIRED, SUSPENDED) */}
          {result.cylinder && (
            <div className="space-y-6">
              {/* 4 Detail Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Manufacturer & Brand
                  </span>
                  <p className="text-base font-bold text-navy-950 mt-1">
                    {result.cylinder.brand}
                  </p>
                  <span className="text-xs text-slate-500 font-mono">
                    Batch: {result.cylinder.batchNumber || "N/A"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Capacity & Tare Weight
                  </span>
                  <p className="text-base font-bold text-navy-950 mt-1">
                    {result.cylinder.capacityKg} kg LPG
                  </p>
                  <span className="text-xs text-slate-500">
                    Tare: {result.cylinder.tareWeightKg} kg • Gross: {result.cylinder.grossWeightKg} kg
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Manufacture Date
                  </span>
                  <p className="text-base font-bold text-navy-950 mt-1">
                    {formatDate(result.cylinder.manufactureDate)}
                  </p>
                  <span className="text-xs text-slate-500">
                    Expires: {formatDate(result.cylinder.expiryDate)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Next Hydrostatic Test
                  </span>
                  <p
                    className={`text-base font-bold mt-1 ${
                      result.status === "EXPIRED" ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {result.cylinder.nextInspectionDate
                      ? formatDate(result.cylinder.nextInspectionDate)
                      : "Due Immediately"}
                  </p>
                  <span className="text-xs text-slate-500">
                    Last: {result.cylinder.lastInspectionDate ? formatDate(result.cylinder.lastInspectionDate) : "None"}
                  </span>
                </div>
              </div>

              {/* Safety Score & Current Dealer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Safety Integrity Rating
                    </span>
                    <span className="font-bold text-sm text-navy-950">
                      {result.cylinder.safetyScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        result.cylinder.safetyScore >= 80
                          ? "bg-emerald-500"
                          : result.cylinder.safetyScore >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${result.cylinder.safetyScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {result.cylinder.notes || "Cylinder integrity validated under standard test protocol."}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Assigned Retail Custodian
                  </span>
                  {result.cylinder.dealer ? (
                    <div>
                      <p className="font-bold text-sm text-navy-950">
                        {result.cylinder.dealer.businessName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {result.cylinder.dealer.upazila}, {result.cylinder.dealer.district} • Ph: {result.cylinder.dealer.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">In transit from regional depot</p>
                  )}
                </div>
              </div>

              {/* Link to Dedicated QR & Certificate Passport */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Need a printed certificate or mobile badge for inspections?
                </div>
                <Link href={`/cylinders/${result.cylinder.id || result.cylinder.serialNumber}`}>
                  <Button size="sm" className="bg-navy-950 hover:bg-navy-900 text-white text-xs gap-1.5 font-bold">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Open Digital Certificate & QR Code
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading cylinder verification registry...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
