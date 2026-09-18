"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Store,
  QrCode,
  TrendingUp,
  AlertTriangle,
  LogOut,
  FileCheck,
  Award,
  Truck,
  Cpu,
  Settings,
  BarChart2,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame,
  Scale,
  RefreshCw,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BangladeshRiskMapWrapper from "@/components/map/bangladesh-risk-map-wrapper";
import { MapMarkerItem } from "@/components/map/bangladesh-risk-map";
import { formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

export default function AdminCommandCenter() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    | "OVERVIEW"
    | "USERS"
    | "DEALERS"
    | "CYLINDERS"
    | "CERTIFICATIONS"
    | "INSPECTIONS"
    | "COMPLAINTS"
    | "STANDARDS"
    | "IOT"
  >("OVERVIEW");

  const [statsData, setStatsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [dealersList, setDealersList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  const [inspectionsList, setInspectionsList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [standardsList, setStandardsList] = useState<any[]>([]);
  const [iotData, setIotData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");

  // Standards creation modal
  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false);
  const [newStdCode, setNewStdCode] = useState("");
  const [newStdTitle, setNewStdTitle] = useState("");
  const [newStdDesc, setNewStdDesc] = useState("");
  const [newStdReqs, setNewStdReqs] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, dealersRes, certsRes, inspsRes, compsRes, stdsRes, iotRes] =
        await Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/users").then((r) => r.json()),
          fetch("/api/dealers").then((r) => r.json()),
          fetch("/api/certifications").then((r) => r.json()),
          fetch("/api/inspections").then((r) => r.json()),
          fetch("/api/complaints").then((r) => r.json()),
          fetch("/api/admin/standards").then((r) => r.json()),
          fetch("/api/iot").then((r) => r.json()),
        ]);

      if (statsRes.success) setStatsData(statsRes);
      if (usersRes.users) setUsersList(usersRes.users);
      if (dealersRes.dealers) setDealersList(dealersRes.dealers);
      if (certsRes.certifications) setCertificationsList(certsRes.certifications);
      if (inspsRes.inspections) setInspectionsList(inspsRes.inspections);
      if (compsRes.complaints) setComplaintsList(compsRes.complaints);
      if (stdsRes.standards) setStandardsList(stdsRes.standards);
      if (iotRes.success) setIotData(iotRes);
    } catch (err) {
      console.error("Admin data loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleCertStatusChange = async (certId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/certifications/${certId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      console.error("Error updating cert:", err);
    }
  };

  const handleComplaintStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      console.error("Error updating complaint:", err);
    }
  };

  const handleCreateStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/standards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newStdCode,
          title: newStdTitle,
          description: newStdDesc,
          requirementsText: newStdReqs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddStandardOpen(false);
        setNewStdCode("");
        setNewStdTitle("");
        setNewStdDesc("");
        setNewStdReqs("");
        loadAllData();
      }
    } catch (err) {
      console.error("Error creating standard:", err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await fetch("/api/iot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolvedNotes: "Resolved by Ministry Safety Dispatcher." }),
      });
      loadAllData();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  // Map markers for Admin
  const mapMarkers: MapMarkerItem[] = dealersList
    .filter((d) => d.latitude && d.longitude)
    .map((d) => {
      let status: "SAFE" | "WARNING" | "DANGER" = "SAFE";
      if (!d.isCertified) status = "WARNING";
      if (d.currentLpgPrice > 1500) status = "DANGER";

      return {
        id: d.id,
        title: d.businessName,
        subtitle: `${d.district}, ${d.division}`,
        latitude: d.latitude,
        longitude: d.longitude,
        status,
        typeLabel: d.isCertified ? "Certified Dealer" : "Pending License",
        metricLabel: "Price (12kg)",
        metricValue: `৳${d.currentLpgPrice}`,
        linkUrl: `/dealers/${d.id}`,
      };
    });

  const sidebarNav = [
    { id: "OVERVIEW", label: "Overview", icon: BarChart2 },
    { id: "USERS", label: "Users Registry", icon: Users, count: usersList.length },
    { id: "DEALERS", label: "Dealers", icon: Store, count: dealersList.length },
    { id: "CERTIFICATIONS", label: "Certifications", icon: Award, count: certificationsList.length },
    { id: "INSPECTIONS", label: "Inspections", icon: FileCheck, count: inspectionsList.length },
    { id: "COMPLAINTS", label: "Complaints", icon: AlertTriangle, count: complaintsList.length },
    { id: "STANDARDS", label: "Safety Standards", icon: Scale, count: standardsList.length },
    { id: "IOT", label: "IoT Telemetry", icon: Cpu, count: iotData?.activeAlertsCount || 0 },
    { id: "SUPPLY_CHAIN_LINK", label: "Supply Chain", icon: Truck, isLink: true, href: "/admin/supply-chain" },
    { id: "AI_HUB_LINK", label: "AI Intelligence Hub", icon: Brain, isLink: true, href: "/admin/ai" },
  ];

  const stats = statsData?.stats;

  // Chart colors
  const COLORS = ["#059669", "#d97706", "#dc2626", "#2563eb", "#7c3aed", "#ec4899", "#06b6d4"];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admin Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-navy-950 text-white flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-navy-950 truncate">
                    {session?.user?.name || "Command Center"}
                  </h3>
                  <Badge variant="danger" className="text-[9px] px-2 py-0.5 font-bold">
                    SYSTEM ADMIN
                  </Badge>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarNav.map((item) => {
                  const Icon = item.icon;
                  if (item.isLink) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href!}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-navy-950 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span>{item.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    );
                  }

                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-navy-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 justify-center"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>National Surveillance Active</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                All 8 divisions synchronized with BSTI & Explosives standards.
              </p>
            </div>
          </aside>

          {/* Main Command Workspace */}
          <main className="lg:col-span-9 space-y-8">
            {/* Header */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  National LPG Regulatory Control Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
                  {activeTab === "OVERVIEW"
                    ? "Administrative Command Center"
                    : activeTab === "USERS"
                    ? "User Access & Role Management"
                    : activeTab === "DEALERS"
                    ? "Authorized Dealership Registry"
                    : activeTab === "CERTIFICATIONS"
                    ? "Statutory Certification Oversight"
                    : activeTab === "INSPECTIONS"
                    ? "Enforcement Audit Records"
                    : activeTab === "COMPLAINTS"
                    ? "Consumer Grievance Investigations"
                    : activeTab === "STANDARDS"
                    ? "Safety Standards & Regulations"
                    : "IoT Real-Time Leakage Surveillance"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ministry of Power, Energy & Mineral Resources • Comprehensive Audit & Enforcement
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadAllData}
                  className="text-xs gap-1.5 border-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Live Data
                </Button>
                {activeTab === "STANDARDS" && (
                  <Button
                    size="sm"
                    onClick={() => setIsAddStandardOpen(true)}
                    className="bg-navy-950 text-white text-xs gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    New Standard
                  </Button>
                )}
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-8">
                {/* 8 Required Admin Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Dealers
                    </span>
                    <div className="text-2xl font-black text-navy-950">
                      {stats?.totalDealers || 0}
                    </div>
                    <span className="text-[11px] text-slate-500">Across 8 divisions</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Certified Dealers
                    </span>
                    <div className="text-2xl font-black text-emerald-600">
                      {stats?.certifiedDealers || 0}
                    </div>
                    <span className="text-[11px] text-emerald-700">
                      {stats?.complianceRate || "0"}% compliance
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Pending Audits
                    </span>
                    <div className="text-2xl font-black text-amber-600">
                      {stats?.pendingInspections || 0}
                    </div>
                    <span className="text-[11px] text-amber-700">Scheduled field visits</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Expired Certs
                    </span>
                    <div className="text-2xl font-black text-rose-600">
                      {stats?.expiredCylinders || 1}
                    </div>
                    <span className="text-[11px] text-rose-700">Requires renewal</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Open Complaints
                    </span>
                    <div className="text-2xl font-black text-navy-950">
                      {stats?.openComplaints || 0}
                    </div>
                    <span className="text-[11px] text-slate-500">Grievances active</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Price Violations
                    </span>
                    <div className="text-2xl font-black text-rose-600">
                      {stats?.priceViolations || 0}
                    </div>
                    <span className="text-[11px] text-rose-700">&gt; BERC monthly cap</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active IoT Alerts
                    </span>
                    <div className="text-2xl font-black text-amber-600">
                      {stats?.activeAlerts || 0}
                    </div>
                    <span className="text-[11px] text-amber-700">Gas leak sensors</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Regional Stock
                    </span>
                    <div className="text-2xl font-black text-blue-600">
                      {stats?.regionalStockMetricTons?.toLocaleString() || "18,450"} MT
                    </div>
                    <span className="text-[11px] text-blue-700">Coastal & inland depots</span>
                  </div>
                </div>

                {/* Recharts Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1: Divisional Dealers Breakdown */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-navy-950">
                          Dealer Certification by Division
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Certified (Green) vs Pending Inspection (Amber)
                        </p>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">
                        Demo Aggregation
                      </Badge>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData?.divisionStats || []}
                          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="division"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            angle={-25}
                            textAnchor="end"
                          />
                          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              fontSize: "12px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          <Bar dataKey="certified" fill="#059669" radius={[4, 4, 0, 0]} name="Certified" />
                          <Bar dataKey="pending" fill="#d97706" radius={[4, 4, 0, 0]} name="Pending" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Grievances Distribution */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-navy-950">
                          Consumer Grievance Categories
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Distribution across safety & price reporting
                        </p>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">
                        Field Registry
                      </Badge>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData?.complaintDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="category"
                            label={({ name, percent }) =>
                              `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                          >
                            {(statsData?.complaintDistribution || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              fontSize: "12px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bangladesh Risk Map */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        National LPG Geographic Risk & Outlet Network
                      </h3>
                      <p className="text-xs text-slate-500">
                        Visualizing certified dealers (Green), pending inspections (Orange), and potential price violations (Red).
                      </p>
                    </div>
                    <Link href="/dealers">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        View Directory <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>

                  <BangladeshRiskMapWrapper markers={mapMarkers} height="440px" />
                </div>
              </div>
            )}

            {/* TAB: USERS MANAGEMENT */}
            {activeTab === "USERS" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-navy-950">
                    System User Registry ({usersList.length} accounts)
                  </h3>
                  <span className="text-xs text-slate-400">
                    RBAC control & role assignment
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Name & Email</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3 text-right">Modify Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <strong className="text-navy-950 block">{u.name}</strong>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{u.phone || "—"}</td>
                          <td className="py-3 px-3 text-slate-600">
                            {u.division ? `${u.division} (${u.district || ""})` : "Bangladesh"}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                u.role === "ADMIN"
                                  ? "danger"
                                  : u.role === "INSPECTOR"
                                  ? "warning"
                                  : u.role === "DEALER"
                                  ? "safe"
                                  : "neutral"
                              }
                              className="text-[10px]"
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                              className="h-8 px-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white"
                            >
                              <option value="CONSUMER">CONSUMER</option>
                              <option value="DEALER">DEALER</option>
                              <option value="INSPECTOR">INSPECTOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DEALERS */}
            {activeTab === "DEALERS" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-navy-950">
                    Licensed Dealer Network ({dealersList.length})
                  </h3>
                  <span className="text-xs text-slate-400">Department of Explosives Registered</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Business Name</th>
                        <th className="py-3 px-3">Trade License</th>
                        <th className="py-3 px-3">Division / District</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Current Price</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dealersList.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-navy-950">
                            {d.businessName}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {d.tradeLicense}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {d.division} • {d.district}
                          </td>
                          <td className="py-3 px-3">
                            {d.isCertified ? (
                              <Badge variant="safe" className="text-[10px]">CERTIFIED</Badge>
                            ) : (
                              <Badge variant="warning" className="text-[10px]">PENDING</Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-navy-950">
                            ৳{d.currentLpgPrice}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/dealers/${d.id}`}>
                              <Button size="sm" variant="outline" className="text-xs">
                                View Profile
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CERTIFICATIONS */}
            {activeTab === "CERTIFICATIONS" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-navy-950">
                    Statutory Certificates Issued ({certificationsList.length})
                  </h3>
                  <span className="text-xs text-slate-400">Validations under BDS 1530:2008</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Certificate Number</th>
                        <th className="py-3 px-3">Entity / Shop</th>
                        <th className="py-3 px-3">Issued Date</th>
                        <th className="py-3 px-3">Expiry Date</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificationsList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-navy-950">
                            {c.certificateNumber}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {c.dealer?.businessName || c.entityId}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(c.issuedAt)}</td>
                          <td className="py-3 px-3 text-emerald-700 font-semibold">{formatDate(c.expiresAt)}</td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                c.status === "APPROVED"
                                  ? "safe"
                                  : c.status === "EXPIRED"
                                  ? "danger"
                                  : "warning"
                              }
                              className="text-[10px]"
                            >
                              {c.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            {c.status !== "APPROVED" && (
                              <button
                                onClick={() => handleCertStatusChange(c.id, "APPROVED")}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                            )}
                            {c.status === "APPROVED" && (
                              <button
                                onClick={() => handleCertStatusChange(c.id, "SUSPENDED")}
                                className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[10px]"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: COMPLAINTS */}
            {activeTab === "COMPLAINTS" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-navy-950">
                    Consumer Grievance Registry ({complaintsList.length})
                  </h3>
                  <span className="text-xs text-slate-400">Investigations & Resolution Audits</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Tracking Ref</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Severity</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {complaintsList.map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-navy-950">
                            <Link href={`/complaints/${comp.id}`} className="hover:underline text-blue-600">
                              {comp.trackingNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {comp.category?.replace(/_/g, " ")}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{comp.location}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                comp.severity === "CRITICAL"
                                  ? "bg-rose-100 text-rose-800"
                                  : comp.severity === "HIGH"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {comp.severity}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                comp.status === "RESOLVED"
                                  ? "safe"
                                  : comp.status === "INVESTIGATION"
                                  ? "warning"
                                  : "neutral"
                              }
                              className="text-[10px]"
                            >
                              {comp.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={comp.status}
                              onChange={(e) => handleComplaintStatusChange(comp.id, e.target.value)}
                              className="h-8 px-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white"
                            >
                              <option value="SUBMITTED">SUBMITTED</option>
                              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                              <option value="INVESTIGATION">INVESTIGATION</option>
                              <option value="RESOLVED">RESOLVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SAFETY STANDARDS */}
            {activeTab === "STANDARDS" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">
                      National Safety Standards Catalog ({standardsList.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configurable statutory rules supporting regulatory processes (Does not create government laws).
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddStandardOpen(true)}
                    className="bg-navy-950 text-white text-xs gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Standard
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {standardsList.map((std) => (
                    <div
                      key={std.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {std.code}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Year: {std.effectiveYear}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-navy-950">{std.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{std.description}</p>
                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <strong>Mandatory Requirements:</strong> {std.requirementsText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: IOT TELEMETRY & ALERTS */}
            {activeTab === "IOT" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">
                      Active Telemetry Units & Emergency Leakage Alerts
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time gas concentration monitoring across domestic kitchens & dealer storage bays.
                    </p>
                  </div>
                  <Link href="/iot">
                    <Button size="sm" className="bg-navy-950 text-white text-xs gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      Open Full IoT Simulator
                    </Button>
                  </Link>
                </div>

                {/* Active Alerts */}
                {iotData?.alerts && iotData.alerts.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase">
                      <Flame className="w-4 h-4 animate-bounce text-rose-600" />
                      Critical Leakage Emergencies ({iotData.alerts.length})
                    </div>
                    <div className="space-y-2">
                      {iotData.alerts.map((al: any) => (
                        <div
                          key={al.id}
                          className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-rose-950 block">
                              Unit: {al.device?.deviceName} ({al.device?.deviceSerial})
                            </strong>
                            <span className="text-slate-500">
                              Reading: <strong>{al.ppmLevel} PPM</strong> • {formatDate(al.alertTimestamp)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(al.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                          >
                            Mark Dispatched / Resolved
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Zero active gas leakage emergencies reported across connected sensor fleet.</span>
                  </div>
                )}

                {/* Device Fleet Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {iotData?.devices?.map((dev: any) => (
                    <div
                      key={dev.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-slate-600" />
                          <strong className="text-xs font-bold text-navy-950">{dev.deviceName}</strong>
                        </div>
                        <Badge
                          variant={
                            dev.status === "ONLINE"
                              ? "safe"
                              : dev.status === "WARNING"
                              ? "warning"
                              : "danger"
                          }
                          className="text-[10px]"
                        >
                          {dev.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-bold">Gas PPM</span>
                          <strong className="text-navy-950 font-mono">{dev.gasLevelPpm?.toFixed(1)}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-bold">Temp</span>
                          <strong className="text-navy-950">{dev.temperatureC?.toFixed(1)}°C</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-bold">Battery</span>
                          <strong className="text-emerald-700">{dev.batteryLevel}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Modal: New Safety Standard */}
        {isAddStandardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <h3 className="text-lg font-black text-navy-950">Add Statutory Safety Standard</h3>
              <form onSubmit={handleCreateStandard} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BDS 1530:2024 (Amendment 2)"
                    value={newStdCode}
                    onChange={(e) => setNewStdCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Specification for Low Carbon Steel LPG Vessels"
                    value={newStdTitle}
                    onChange={(e) => setNewStdTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newStdDesc}
                    onChange={(e) => setNewStdDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Requirements Text</label>
                  <textarea
                    required
                    rows={2}
                    value={newStdReqs}
                    onChange={(e) => setNewStdReqs(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddStandardOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy-950 text-white">
                    Publish Standard
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
