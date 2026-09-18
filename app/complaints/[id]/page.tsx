"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params?.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!complaintId) return;

    fetch(`/api/complaints/${complaintId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.complaint) setComplaint(data.complaint);
      })
      .catch((err) => console.error("Error loading complaint:", err))
      .finally(() => setIsLoading(false));
  }, [complaintId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-3 text-xs text-slate-500">Retrieving grievance case file...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy-950">Grievance Record Not Found</h2>
        <p className="text-xs text-slate-500">
          No incident report matches tracking reference "{complaintId}".
        </p>
        <Link href="/complaints">
          <Button variant="outline" size="sm">
            Back to Grievances
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge variant="safe" className="px-3 py-1 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            RESOLVED
          </Badge>
        );
      case "INVESTIGATION":
        return (
          <Badge variant="warning" className="px-3 py-1 text-xs font-bold">
            <Clock className="w-4 h-4 mr-1" />
            FIELD INVESTIGATION IN PROGRESS
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge variant="neutral" className="px-3 py-1 text-xs font-bold">
            OFFICER ASSIGNED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="danger" className="px-3 py-1 text-xs font-bold">
            REJECTED / UNFOUNDED
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="px-3 py-1 text-xs font-bold">
            SUBMITTED
          </Badge>
        );
    }
  };

  const updates = complaint.updates || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Grievance Registry
        </Link>

        {/* Header File Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Grievance Tracking Number
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-navy-950">
                {complaint.trackingNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Category: <strong className="text-navy-950">{complaint.category.replace(/_/g, " ")}</strong></span>
                <span>•</span>
                <span>Filed: {formatDate(complaint.createdAt)}</span>
              </div>
            </div>
            <div>{getStatusBadge(complaint.status)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Incident Location
              </span>
              <p className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                {complaint.location}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Reported Retail Outlet
              </span>
              {complaint.dealer ? (
                <Link
                  href={`/dealers/${complaint.dealer.id}`}
                  className="text-xs font-bold text-navy-950 hover:underline flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  {complaint.dealer.businessName} ({complaint.dealer.division})
                </Link>
              ) : (
                <span className="text-xs text-slate-500">Unlicensed / Mobile Trader</span>
              )}
            </div>
          </div>

          {/* Grievance Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Grievance Statement & Particulars
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Evidence Photo */}
          {complaint.photoUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submitted Photographic / Memo Evidence
              </h3>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                <img
                  src={complaint.photoUrl}
                  alt="Evidence"
                  className="max-h-72 rounded-lg object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Investigation & Audit Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-navy-950">
              Statutory Investigation Timeline & Audit Log
            </h3>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {updates.map((upd: any, idx: number) => (
              <div key={upd.id} className="relative space-y-1.5">
                <div
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    idx === updates.length - 1 ? "bg-emerald-600" : "bg-slate-400"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="text-[10px]">
                    {upd.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(upd.createdAt)}
                  </span>
                  {upd.updatedBy && (
                    <span className="text-[11px] text-slate-600 font-semibold">
                      by {upd.updatedBy.name} ({upd.updatedBy.role})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {upd.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
