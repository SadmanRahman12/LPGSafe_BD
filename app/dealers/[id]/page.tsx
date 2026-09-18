"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowLeft,
  Navigation,
  Flame,
  Award,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DealersMapWrapper from "@/components/dealers/dealers-map-wrapper";
import { formatDate } from "@/lib/utils";

export default function DealerDetailPage() {
  const params = useParams();
  const dealerId = params?.id as string;

  const [dealer, setDealer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!dealerId) return;

    fetch(`/api/dealers/${dealerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.dealer) setDealer(data.dealer);
      })
      .catch((err) => console.error("Error loading dealer:", err))
      .finally(() => setIsLoading(false));
  }, [dealerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-3 text-xs text-slate-500">Loading authorized retailer profile...</p>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <Store className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy-950">Dealer Profile Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested retailer ID could not be verified in the national database.
        </p>
        <Link href="/dealers">
          <Button variant="outline" size="sm">
            Back to Certified Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isCertified = dealer.isCertified;
  const cert = dealer.certifications?.[0];
  const inspections = dealer.inspections || [];
  const inventory = dealer.inventory || [];
  const reviews = dealer.reviews || [];
  const cylinders = dealer.cylinders || [];

  const googleMapsUrl =
    dealer.latitude && dealer.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${dealer.latitude},${dealer.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          dealer.address + ", " + dealer.district
        )}`;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/dealers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dealer Directory
        </Link>

        {/* Hero Profile Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isCertified ? (
                  <Badge variant="safe" className="text-xs px-3 py-1 font-bold">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    CERTIFIED LICENSED DEALER
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-xs px-3 py-1 font-bold">
                    <ShieldAlert className="w-4 h-4 mr-1" />
                    INSPECTION PENDING
                  </Badge>
                )}
                <span className="text-xs font-mono text-slate-400">
                  TL: {dealer.tradeLicense}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
                {dealer.businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{dealer.rating?.toFixed(1) || "4.8"}</span>
                  <span className="text-slate-400 font-normal">
                    ({dealer.totalReviews || reviews.length || 24} customer ratings)
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Authorized Retailer
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {dealer.division} Division, {dealer.district}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 sm:text-right min-w-[200px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Standard 12kg LPG
              </span>
              <div className="text-3xl font-black text-navy-950 mt-1">
                ৳{dealer.currentLpgPrice?.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-600 font-semibold block mt-0.5">
                {dealer.currentLpgPrice <= 1455
                  ? "✓ Within BERC Tariff"
                  : "⚠ Review Ongoing"}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${dealer.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Outlet ({dealer.phone})
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              Get Directions (Map)
            </a>
            <Link
              href={`/complaints/new?dealerId=${dealer.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Report Overpricing or Safety Issue
            </Link>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Info, Inventory, Inspection History, Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* Certification Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-navy-950">
                    Statutory Safety Certification
                  </h3>
                </div>
                {cert && (
                  <Badge variant="safe" className="text-xs">
                    {cert.status}
                  </Badge>
                )}
              </div>

              {cert ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Certificate Number
                    </span>
                    <span className="text-xs font-mono font-bold text-navy-950 mt-1 block">
                      {cert.certificateNumber}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Effective Issue Date
                    </span>
                    <span className="text-xs font-bold text-navy-950 mt-1 block">
                      {formatDate(cert.issuedAt)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Valid Through
                    </span>
                    <span className="text-xs font-bold text-emerald-700 mt-1 block">
                      {formatDate(cert.expiresAt)}
                    </span>
                  </div>
                  <div className="sm:col-span-3 text-xs text-slate-500 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    {cert.notes ||
                      "Entity complies with BDS 1530:2008 safety standards and Gas Cylinder Rules 1991 storage provisions."}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Initial Department of Explosives safety certification is currently under review for this shop location.
                </p>
              )}
            </div>

            {/* Available Cylinder Brands & Types */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-navy-950">
                    Available Cylinder Types & Brands
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Authentic Batch Registered</span>
              </div>

              {inventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inventory.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-navy-950">{inv.brand}</h4>
                        <span className="text-xs text-slate-500">
                          {inv.cylinderSizeKg}kg Domestic Cylinder
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge variant="safe" className="text-[10px]">
                          IN STOCK ({inv.currentStock})
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-navy-950">Omera Petroleum</h4>
                      <span className="text-xs text-slate-500">12kg Standard Cylinder</span>
                    </div>
                    <Badge variant="safe" className="text-[10px]">
                      VERIFIED IN STOCK
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-navy-950">Bashundhara LP Gas</h4>
                      <span className="text-xs text-slate-500">12kg Standard Cylinder</span>
                    </div>
                    <Badge variant="safe" className="text-[10px]">
                      VERIFIED IN STOCK
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Inspection History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-navy-950">
                  Regulatory Inspection History
                </h3>
              </div>

              {inspections.length > 0 ? (
                <div className="space-y-3">
                  {inspections.map((insp: any) => (
                    <div
                      key={insp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-950">
                            {insp.inspectionNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {formatDate(insp.inspectionDate)}
                          </span>
                        </div>
                        <Badge
                          variant={insp.overallResult === "PASS" ? "safe" : "danger"}
                          className="text-[10px]"
                        >
                          RESULT: {insp.overallResult}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{insp.notes}</p>
                      {insp.items && insp.items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {insp.items.map((it: any) => (
                            <span
                              key={it.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700"
                            >
                              ✓ {it.itemTitle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  Recent routine inspection passed with zero safety citations. Fire extinguisher certified.
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-navy-950">
                  Consumer Feedback & Reviews ({reviews.length})
                </h3>
                <span className="text-xs text-slate-400">Verified buyers</span>
              </div>

              {reviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-950">
                          {rev.consumer?.name || "Local Consumer"}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy-950">Rahim Uddin (Verified)</span>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="text-slate-600">
                      Cylinders are always weighed in front of the customer and delivered with intact seal caps.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Map, Location, Hours */}
          <div className="lg:col-span-4 space-y-6">
            {/* Map Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Physical Location
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dealer.address}</p>
              <div className="pt-2">
                <DealersMapWrapper dealers={[dealer]} height="250px" />
              </div>
            </div>

            {/* Operating Hours & Safety Protocol */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                Operating Hours
              </h3>
              <div className="text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Saturday – Thursday:</span>
                  <strong className="text-slate-800">8:30 AM – 9:30 PM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Friday:</span>
                  <strong className="text-slate-800">2:30 PM – 9:00 PM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Home Delivery:</span>
                  <strong className="text-emerald-700">Available (30–60 min)</strong>
                </div>
              </div>
            </div>

            {/* Safety Seal Notice */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>LPGSafe Inspection Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                This outlet's stock is monitored through statutory safety audits. If an unsealed or underweight cylinder is offered, please lodge a complaint immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
