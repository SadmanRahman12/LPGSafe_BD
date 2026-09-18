"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Store,
  ShieldCheck,
  Package,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Award,
  Users,
  LogOut,
  PlusCircle,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DealerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>({
    totalStock: 83,
    todaysSales: 14,
    activeCylinders: 68,
    isCertified: true,
    pendingIssues: 1,
    currentPrice: 1450,
  });
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [priceInput, setPriceInput] = useState("1450");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceUpdateStatus, setPriceUpdateStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadDealerData() {
      try {
        const [invRes, compRes] = await Promise.all([
          fetch("/api/inventory").then((r) => r.json()),
          fetch("/api/complaints").then((r) => r.json()),
        ]);

        if (invRes.success) {
          setInventoryList(invRes.inventory || []);
          if (invRes.stats) {
            setStats((prev: any) => ({
              ...prev,
              totalStock: invRes.stats.totalStock,
            }));
          }
        }

        if (compRes.success) {
          setComplaintsList(compRes.complaints || []);
          setStats((prev: any) => ({
            ...prev,
            pendingIssues: (compRes.complaints || []).filter((c: any) => c.status !== "RESOLVED")
              .length,
          }));
        }
      } catch (err) {
        console.error("Error loading dealer dashboard:", err);
      }
    }
    loadDealerData();
  }, []);

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPrice(true);
    setPriceUpdateStatus(null);
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: "Dhaka",
          district: "Dhaka",
          cylinderSizeKg: 12.0,
          reportedPrice: parseFloat(priceInput),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStats((prev: any) => ({ ...prev, currentPrice: parseFloat(priceInput) }));
        setPriceUpdateStatus("Price updated successfully!");
        setTimeout(() => setPriceUpdateStatus(null), 3000);
      } else {
        setPriceUpdateStatus(data.error || "Failed to update price");
      }
    } catch (err) {
      setPriceUpdateStatus("Error updating price");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dealer/dashboard", icon: LayoutDashboard, active: true },
    { label: "Inventory", href: "/dealer/inventory", icon: Package, count: stats.totalStock },
    { label: "Cylinders", href: "/verify", icon: Flame },
    { label: "Prices", href: "/prices", icon: TrendingUp },
    { label: "Bookings/Sales", href: "/dealer/inventory#sales", icon: DollarSign },
    { label: "Inspections", href: "#inspections", icon: FileCheck },
    { label: "Certification", href: "#certification", icon: Award },
    { label: "Complaints", href: "/complaints", icon: AlertCircle, count: stats.pendingIssues },
    { label: "Profile", href: "#profile", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base">
                  <Store className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-navy-950 truncate">
                    {session?.user?.name || "Dealer Portal"}
                  </h3>
                  <Badge variant="safe" className="text-[10px] px-2 py-0.5">
                    CERTIFIED DEALER
                  </Badge>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        item.active
                          ? "bg-navy-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count != null ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            item.active
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
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

            {/* Quick Inventory Action */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Package className="w-4 h-4" />
                <span>Stock Operations</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add stock batches, record daily sales, or adjust inventory thresholds in real-time.
              </p>
              <Link href="/dealer/inventory" className="block pt-1">
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
                  Manage Stock Inventory
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* Top Bar */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Operational Control Center
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
                  Dealer Command: {session?.user?.name || "Gulshan Point"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track authenticated cylinders, stock inventory, customer sales, and regulatory compliance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/dealer/inventory">
                  <Button size="sm" className="bg-navy-950 hover:bg-navy-900 text-white text-xs gap-1.5 font-bold">
                    <PlusCircle className="w-4 h-4" />
                    Record Stock / Sale
                  </Button>
                </Link>
              </div>
            </div>

            {/* 5 Required Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Current Inventory */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Inventory
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-navy-950">
                  {stats.totalStock} Cylinders
                </div>
                <p className="text-xs text-slate-500">
                  {inventoryList.length > 0
                    ? `${inventoryList.length} brand batches in warehouse`
                    : "48 Omera • 35 Bashundhara"}
                </p>
                <Link
                  href="/dealer/inventory"
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-emerald-800"
                >
                  Inspect warehouse stock <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 2: Today's Sales */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Today's Sales
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-navy-950">
                  {stats.todaysSales} Dispensed
                </div>
                <p className="text-xs text-slate-500">
                  Gross Revenue: ৳{(stats.todaysSales * stats.currentPrice).toLocaleString()}
                </p>
                <Link
                  href="/dealer/inventory"
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-blue-700"
                >
                  Record new cylinder sale <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 3: Active Cylinders */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Cylinders
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-700">
                  {stats.activeCylinders} Verified
                </div>
                <p className="text-xs text-slate-500">
                  100% compliant with BSTI hydro-test specs
                </p>
                <Link
                  href="/verify"
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-emerald-800"
                >
                  Scan cylinder collar <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 4: Certification Status */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Certification Status
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-navy-950 flex items-center gap-1.5">
                  <span>APPROVED</span>
                </div>
                <p className="text-xs text-slate-500">
                  Valid through Jan 2027 (Chief Inspector of Explosives)
                </p>
                <div className="text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-100">
                  ✓ License in Good Standing
                </div>
              </div>

              {/* Card 5: Pending Issues */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pending Issues & Complaints
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-600">
                    {stats.pendingIssues}
                  </span>
                  <span className="text-xs text-slate-500">
                    open inquiry requires review or evidence submission
                  </span>
                </div>
                <Link
                  href="/complaints"
                  className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-amber-700"
                >
                  View customer feedback & audit responses <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Quick Price Declaration Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-navy-950">
                    Declare Outlet Selling Price (12kg Cylinder)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your published retail price shown to consumers. BERC ceiling is currently ৳1,455.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-700 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                  Current: ৳{stats.currentPrice}
                </div>
              </div>

              <form onSubmit={handlePriceUpdate} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    required
                    min="1000"
                    max="3000"
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-navy-950"
                  />
                </div>
                <Button
                  type="submit"
                  size="md"
                  isLoading={isUpdatingPrice}
                  className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-6 h-11 w-full sm:w-auto"
                >
                  Publish New Rate
                </Button>
              </form>

              {priceUpdateStatus && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  {priceUpdateStatus}
                </p>
              )}
            </div>

            {/* Recent Inventory Batches Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-navy-950">Active Warehouse Stock</h3>
                  <p className="text-xs text-slate-500">
                    Live inventory counts tracked by Department of Explosives serial batching.
                  </p>
                </div>
                <Link href="/dealer/inventory">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    Manage Full Inventory <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {inventoryList.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-navy-950">{item.brand}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600">{item.cylinderSizeKg}kg</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Alert Threshold: {item.minStockAlert} units
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-navy-950">
                          {item.currentStock}
                        </span>
                        <span className="text-[11px] text-slate-400 block">in stock</span>
                      </div>
                      <Badge
                        variant={item.currentStock <= item.minStockAlert ? "warning" : "safe"}
                        className="text-[10px]"
                      >
                        {item.currentStock <= item.minStockAlert ? "LOW STOCK" : "OPTIMAL"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
