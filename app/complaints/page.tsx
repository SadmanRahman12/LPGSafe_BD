"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  ArrowLeft,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const statuses = [
    "ALL",
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "INVESTIGATION",
    "RESOLVED",
    "REJECTED",
  ];

  const categories = [
    "ALL",
    "OVERPRICING",
    "UNSAFE_INSTALLATION",
    "GAS_LEAKAGE",
    "DAMAGED_CYLINDER",
    "POOR_EQUIPMENT",
    "UNLICENSED_DEALER",
    "OTHER",
  ];

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (searchQuery) params.set("trackingNumber", searchQuery);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge variant="safe">RESOLVED</Badge>;
      case "INVESTIGATION":
        return <Badge variant="warning">UNDER INVESTIGATION</Badge>;
      case "ASSIGNED":
        return <Badge variant="neutral">OFFICER ASSIGNED</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="neutral">UNDER REVIEW</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="neutral">SUBMITTED</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            HIGH RISK
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            MEDIUM
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>National Regulatory Grievance Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Safety & Overpricing Grievance Tracker
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Lodge grievances regarding cylinder defects, unsafe gas installation, illegal decanting, or retail price violations. Each complaint receives a unique tracking ID and verified audit timeline.
            </p>
          </div>

          <Link href="/complaints/new">
            <Button className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs gap-1.5 self-start shadow-sm">
              <PlusCircle className="w-4 h-4" />
              File New Complaint
            </Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracking number e.g. CMP-2026-..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Categories" : c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <Button type="submit" size="md" className="w-full bg-navy-950 text-white text-xs">
                Search
              </Button>
            </div>
          </form>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-navy-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List Table/Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
              <p className="mt-3 text-xs text-slate-500 font-medium">Loading complaints registry...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-navy-950">No Complaints Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No filed complaints match your current filter selection.
              </p>
              <Link href="/complaints/new">
                <Button size="sm" variant="outline" className="text-xs">
                  File a New Safety Complaint
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <Link
                  key={c.id}
                  href={`/complaints/${c.id}`}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-950 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {c.trackingNumber}
                      </span>
                      {getSeverityBadge(c.severity)}
                      <span className="text-xs font-bold text-slate-700">
                        {c.category.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Location: {c.location}</span>
                      {c.dealer && <span>• Outlet: {c.dealer.businessName}</span>}
                      <span>• Filed: {formatDate(c.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {getStatusBadge(c.status)}
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-navy-950 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
