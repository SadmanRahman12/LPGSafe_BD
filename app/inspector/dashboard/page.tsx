"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  LogOut,
  PlusCircle,
  FileCheck,
  Calendar,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Building,
  Award,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BangladeshRiskMapWrapper from "@/components/map/bangladesh-risk-map-wrapper";
import { MapMarkerItem } from "@/components/map/bangladesh-risk-map";
import { formatDate } from "@/lib/utils";

export default function InspectorDashboard() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    passed: 0,
    failed: 0,
    conditional: 0,
    highRisk: 0,
  });
  const [dealers, setDealers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "COMPLETED" | "HIGH_RISK">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Schedule modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [inspRes, dealerRes] = await Promise.all([
        fetch("/api/inspections").then((r) => r.json()),
        fetch("/api/dealers").then((r) => r.json()),
      ]);

      if (inspRes.success) {
        setInspections(inspRes.inspections || []);
        if (inspRes.stats) setStats(inspRes.stats);
      }
      if (dealerRes.dealers) {
        setDealers(dealerRes.dealers);
      }
    } catch (err) {
      console.error("Error loading inspector dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerId) return;

    setIsSubmittingSchedule(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: selectedDealerId,
          notes: scheduleNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleSuccess("Inspection successfully scheduled!");
        setTimeout(() => {
          setIsScheduleOpen(false);
          setScheduleSuccess(null);
          setSelectedDealerId("");
          setScheduleNotes("");
          fetchData();
        }, 1200);
      }
    } catch (err) {
      console.error("Error scheduling inspection:", err);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Convert inspections and dealers to map markers
  const mapMarkers: MapMarkerItem[] = inspections
    .filter((i) => i.dealer?.latitude && i.dealer?.longitude)
    .map((i) => {
      let status: "SAFE" | "WARNING" | "DANGER" = "SAFE";
      if (i.overallResult === "FAIL" || i.riskLevel === "HIGH" || i.riskLevel === "CRITICAL") {
        status = "DANGER";
      } else if (i.overallResult === "CONDITIONAL" || !i.dealer?.isCertified) {
        status = "WARNING";
      }

      return {
        id: i.id,
        title: i.dealer?.businessName || "Dealership",
        subtitle: `${i.dealer?.upazila || i.dealer?.district}, ${i.dealer?.division}`,
        latitude: i.dealer.latitude,
        longitude: i.dealer.longitude,
        status,
        typeLabel: `Audit: ${i.overallResult}`,
        metricLabel: "Risk Level",
        metricValue: i.riskLevel,
        linkUrl: `/inspector/inspections/${i.id}`,
      };
    });

  const filteredInspections = inspections.filter((i) => {
    if (activeTab === "PENDING" && i.overallResult !== "CONDITIONAL") return false;
    if (activeTab === "COMPLETED" && i.overallResult === "CONDITIONAL") return false;
    if (activeTab === "HIGH_RISK" && i.riskLevel !== "HIGH" && i.riskLevel !== "CRITICAL") return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.inspectionNumber.toLowerCase().includes(q) ||
      i.dealer?.businessName?.toLowerCase().includes(q) ||
      i.dealer?.division?.toLowerCase().includes(q) ||
      i.dealer?.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="font-bold text-xs">
                Department of Explosives — Enforcement Division
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {session?.user?.name || "Inspector Mahmudul Hasan"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
              Field Safety Inspection Command
            </h1>
            <p className="text-xs text-slate-500">
              Statutory multi-point safety verification, certification approvals, and on-site hazard remediation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsScheduleOpen(true)}
              className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Schedule Inspection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* 6 Key Operational KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Assigned Audits
            </span>
            <div className="text-2xl font-black text-navy-950">{stats.total}</div>
            <span className="text-[11px] text-slate-500">Scheduled & active</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Completed / Cleared
            </span>
            <div className="text-2xl font-black text-emerald-600">{stats.passed}</div>
            <span className="text-[11px] text-emerald-700">Passed standard</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pending Action
            </span>
            <div className="text-2xl font-black text-amber-600">{stats.conditional}</div>
            <span className="text-[11px] text-amber-700">Audit in progress</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              High-Risk Outlets
            </span>
            <div className="text-2xl font-black text-rose-600">{stats.highRisk}</div>
            <span className="text-[11px] text-rose-700">Immediate hazard</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Violations Logged
            </span>
            <div className="text-2xl font-black text-navy-950">{stats.failed}</div>
            <span className="text-[11px] text-slate-500">Failed compliance</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Active Network
            </span>
            <div className="text-2xl font-black text-blue-600">{dealers.length}</div>
            <span className="text-[11px] text-blue-700">Registered shops</span>
          </div>
        </div>

        {/* Bangladesh Geographic Inspection Map */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Bangladesh Inspection & Geographic Risk Map
              </h2>
              <p className="text-xs text-slate-500">
                Spatial distribution of scheduled field audits, compliant retail facilities, and flagged hazard locations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pass / Low Risk
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending / Conditional
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Risk / Failed
              </span>
            </div>
          </div>

          <BangladeshRiskMapWrapper markers={mapMarkers} height="400px" />
        </div>

        {/* Inspection List & Checklist Access */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "ALL"
                    ? "bg-navy-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Inspections ({inspections.length})
              </button>
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "PENDING"
                    ? "bg-navy-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pending Review ({stats.conditional})
              </button>
              <button
                onClick={() => setActiveTab("COMPLETED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "COMPLETED"
                    ? "bg-navy-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Completed Audits ({stats.passed + stats.failed})
              </button>
              <button
                onClick={() => setActiveTab("HIGH_RISK")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "HIGH_RISK"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                High Risk Flagged ({stats.highRisk})
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading audit registry...</div>
          ) : filteredInspections.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No inspections match the current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Inspection ID</th>
                    <th className="py-3 px-3">Dealership & Location</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Overall Result</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3">Checklist Progress</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInspections.map((insp) => {
                    const passCount = insp.items?.filter((i: any) => i.result === "PASS").length || 0;
                    const totalItems = insp.items?.length || 0;

                    return (
                      <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-navy-950">
                          {insp.inspectionNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <strong className="text-slate-900 block font-bold">
                            {insp.dealer?.businessName}
                          </strong>
                          <span className="text-[11px] text-slate-400">
                            {insp.dealer?.division} • {insp.dealer?.district}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {formatDate(insp.inspectionDate)}
                        </td>
                        <td className="py-3.5 px-3">
                          {insp.overallResult === "PASS" ? (
                            <Badge variant="safe" className="text-[10px]">PASS</Badge>
                          ) : insp.overallResult === "FAIL" ? (
                            <Badge variant="danger" className="text-[10px]">FAIL</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">CONDITIONAL</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                              insp.riskLevel === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : insp.riskLevel === "HIGH"
                                ? "bg-amber-100 text-amber-800"
                                : insp.riskLevel === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {insp.riskLevel}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: totalItems > 0 ? `${(passCount / totalItems) * 100}%` : "0%",
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {passCount}/{totalItems}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link href={`/inspector/inspections/${insp.id}`}>
                            <Button size="sm" className="bg-navy-950 hover:bg-navy-900 text-white text-xs gap-1">
                              Digital Audit <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule Inspection Modal */}
        {isScheduleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <h3 className="text-xl font-black text-navy-950">
                  Schedule Statutory On-Site Inspection
                </h3>
                <p className="text-xs text-slate-500">
                  Provision digital multi-point safety checklist under Explosives Act 1884.
                </p>
              </div>

              {scheduleSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                  {scheduleSuccess}
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Dealership Outlet
                  </label>
                  <select
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-navy-950 bg-white"
                  >
                    <option value="">-- Choose Retailer --</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.businessName} ({d.division} • {d.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Inspection Notes / Scope
                  </label>
                  <textarea
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Periodic 2-year certification renewal; audit fire safety clearances..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingSchedule || !selectedDealerId}
                    className="bg-navy-950 text-white hover:bg-navy-900"
                  >
                    {isSubmittingSchedule ? "Provisioning..." : "Assign Inspection"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
