"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  QrCode,
  Calendar,
  Scale,
  Building,
  ArrowLeft,
  Printer,
  Download,
  AlertTriangle,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QRCodeCard from "@/components/ui/qr-code-card";
import { formatDate } from "@/lib/utils";

export default function CylinderDetailPage() {
  const params = useParams();
  const cylinderId = params?.id as string;

  const [cylinder, setCylinder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cylinderId) return;

    fetch(`/api/cylinders/${cylinderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.cylinder) setCylinder(data.cylinder);
      })
      .catch((err) => console.error("Error loading cylinder:", err))
      .finally(() => setIsLoading(false));
  }, [cylinderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-3 text-xs text-slate-500">Retrieving digital cylinder certificate...</p>
      </div>
    );
  }

  if (!cylinder) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy-950">Cylinder Record Not Found</h2>
        <p className="text-xs text-slate-500">
          No cylinder with identifier "{cylinderId}" was found in the national registry.
        </p>
        <Link href="/verify">
          <Button variant="outline" size="sm">
            Try Verifying Again
          </Button>
        </Link>
      </div>
    );
  }

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
            EXPIRED — OVERDUE HYDRO-TEST
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="warning" className="px-3 py-1 text-sm font-bold">
            <ShieldAlert className="w-4 h-4 mr-1" />
            SUSPENDED — WITHDRAWN
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="px-3 py-1 text-sm font-bold">
            <HelpCircle className="w-4 h-4 mr-1" />
            NOT VERIFIED
          </Badge>
        );
    }
  };

  const isExpired = cylinder.status === "EXPIRED";
  const isSuspended = cylinder.status === "SUSPENDED";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/verify"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cylinder Verifier
          </Link>
          <div className="text-xs text-slate-400 font-mono">
            BSTI BDS 1530:2008 Standard
          </div>
        </div>

        {/* Certificate Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                National LPG Cylinder Digital Passport
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-navy-950">
                {cylinder.serialNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Registered under the Department of Explosives statutory tracking database.
              </p>
            </div>
            <div>{getStatusBadge(cylinder.status)}</div>
          </div>

          {/* Alert Callout if Expired or Suspended */}
          {isExpired && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-bold">Statutory Expiration Warning:</strong> This cylinder's periodic hydrostatic pressure re-testing interval has lapsed. Do not connect to gas stoves. Request an immediate exchange from your dealer.
              </div>
            </div>
          )}

          {isSuspended && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-bold">Safety Recall Notice:</strong> This batch unit has been suspended by safety inspectors due to identified weld or valve abnormalities.
              </div>
            </div>
          )}

          {/* 2-Column Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: QR Code Card & Download */}
            <div className="md:col-span-5 space-y-4">
              <QRCodeCard
                value={cylinder.qrCode || cylinder.serialNumber}
                title={cylinder.brand}
                subtext={`Serial: ${cylinder.serialNumber}`}
                size={220}
                showDownload={true}
              />

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Batch Number:</span>
                  <strong className="font-mono text-slate-800">
                    {cylinder.batchNumber || "OMR-BD-2024"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <strong className="text-slate-800">{cylinder.capacityKg} kg LPG</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tare Weight:</span>
                  <strong className="text-slate-800">{cylinder.tareWeightKg} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gross Weight:</span>
                  <strong className="text-slate-800">
                    {cylinder.grossWeightKg || cylinder.tareWeightKg + cylinder.capacityKg} kg
                  </strong>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs, Dates, Dealer Custodian */}
            <div className="md:col-span-7 space-y-6">
              {/* Safety Score Meter */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Structural Integrity Rating
                  </span>
                  <span className="text-base font-black text-navy-950">
                    {cylinder.safetyScore} / 100
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cylinder.safetyScore >= 80
                        ? "bg-emerald-500"
                        : cylinder.safetyScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${cylinder.safetyScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  {cylinder.notes || "Hydrostatic test certified. Valve seal passed high-pressure burst tolerance test."}
                </p>
              </div>

              {/* Inspection Dates Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Manufacture Date</span>
                  </div>
                  <p className="text-base font-bold text-navy-950">
                    {formatDate(cylinder.manufactureDate)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Lifespan ceiling: {formatDate(cylinder.expiryDate)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Next Hydro-Test Due</span>
                  </div>
                  <p
                    className={`text-base font-bold ${
                      isExpired ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {cylinder.nextInspectionDate
                      ? formatDate(cylinder.nextInspectionDate)
                      : "Immediate Action Required"}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Last: {cylinder.lastInspectionDate ? formatDate(cylinder.lastInspectionDate) : "None"}
                  </span>
                </div>
              </div>

              {/* Custodian Retail Outlet */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Current Authorized Retail Custodian
                </span>
                {cylinder.dealer ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base text-navy-950">
                        {cylinder.dealer.businessName}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {cylinder.dealer.address || `${cylinder.dealer.upazila}, ${cylinder.dealer.district}`}
                      </p>
                      <span className="text-xs font-semibold text-slate-700 block mt-1">
                        Contact: {cylinder.dealer.phone}
                      </span>
                    </div>
                    <Link href={`/dealers/${cylinder.dealer.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Outlet
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    In transit from regional coastal storage terminal.
                  </p>
                )}
              </div>

              {/* Safety Guidance */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5">
                <span className="text-xs font-bold block">Consumer Safety Tip:</span>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Before accepting this cylinder from delivery personnel, verify that the PVC safety cap seal is unbroken and matches the stamped tare weight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
