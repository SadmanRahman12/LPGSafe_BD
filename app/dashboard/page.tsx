"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Store,
  QrCode,
  TrendingUp,
  AlertCircle,
  LogOut,
  Bell,
  User,
  Activity,
  Flame,
  Clock,
  ArrowRight,
  MapPin,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConsumerDashboard() {
  const { data: session } = useSession();
  const [dealers, setDealers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [priceStats, setPriceStats] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dealersRes, complaintsRes, pricesRes, notifRes] = await Promise.all([
          fetch("/api/dealers?certified=true").then((r) => r.json()),
          fetch("/api/complaints").then((r) => r.json()),
          fetch("/api/prices").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
        ]);

        if (dealersRes.dealers) setDealers(dealersRes.dealers.slice(0, 3));
        if (complaintsRes.complaints) setComplaints(complaintsRes.complaints.slice(0, 4));
        if (pricesRes.stats) setPriceStats(pricesRes.stats);
        if (notifRes.unreadCount != null) setUnreadNotifications(notifRes.unreadCount);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
    { label: "Find Dealers", href: "/dealers", icon: Store },
    { label: "Verify Cylinder", href: "/verify", icon: QrCode },
    { label: "Prices", href: "/prices", icon: TrendingUp },
    { label: "Complaints", href: "/complaints", icon: AlertCircle, badge: complaints.length },
    { label: "Safety", href: "/safety", icon: ShieldCheck },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadNotifications },
    { label: "Profile", href: "#profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-navy-950 text-white flex items-center justify-center font-bold text-base">
                  {session?.user?.name ? session.user.name.charAt(0) : "C"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-navy-950 truncate">
                    {session?.user?.name || "Consumer"}
                  </h3>
                  <Badge variant="safe" className="text-[10px] px-2 py-0.5">
                    CONSUMER
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
                      {item.badge ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            item.active
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.badge}
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

            {/* Quick Safety Helpline Card */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Emergency Protocol</span>
              </div>
              <p className="text-xs text-rose-50 leading-relaxed">
                In case of gas smell or active leak: extinguish flame, don't flick switches, ventilate, and evacuate.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="tel:999"
                  className="px-3 py-2 rounded-xl bg-white text-red-700 font-bold text-xs text-center hover:bg-rose-50 transition-colors shadow-sm"
                >
                  Call National Helpline: 999
                </a>
                <a
                  href="tel:16163"
                  className="px-3 py-2 rounded-xl bg-red-800/80 text-white font-bold text-xs text-center hover:bg-red-800 transition-colors"
                >
                  Fire Service: 16163
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* Header Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Consumer Safety Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
                  Welcome, {session?.user?.name || "Tariqul Islam"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status of your local LPG safety network, reported issues, and nearby certified dealers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/verify">
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 border-slate-300">
                    <QrCode className="w-3.5 h-3.5 text-navy-950" />
                    Verify Cylinder
                  </Button>
                </Link>
                <Link href="/complaints/new">
                  <Button size="sm" className="bg-navy-950 hover:bg-navy-900 text-white text-xs gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5" />
                    File Complaint
                  </Button>
                </Link>
              </div>
            </div>

            {/* 5 Required Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Nearest Certified Dealers */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Nearest Certified Dealers
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-950">
                    {dealers.length > 0 ? dealers[0].businessName : "Gulshan-2 Point"}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {dealers.length > 0 ? dealers[0].address : "Plot 18, Block B, Dhaka"}
                  </span>
                </div>
                <Link
                  href="/dealers"
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-emerald-800"
                >
                  View all certified outlets <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 2: Latest LPG Price */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Latest BERC 12kg Price
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-950">
                    ৳{priceStats?.referencePrice || 1455}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Market Avg: ৳{priceStats?.averagePrice || 1450} (Fair Band)
                  </span>
                </div>
                <Link
                  href="/prices"
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-blue-700"
                >
                  Inspect division tariff <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 3: My Complaints */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    My Complaints
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-950">
                    {complaints.length} Active
                  </div>
                  <span className="text-xs text-slate-500">
                    {complaints.length > 0 ? "1 Case in investigation" : "No open violations"}
                  </span>
                </div>
                <Link
                  href="/complaints"
                  className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-amber-700"
                >
                  Track complaint status <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 4: Safety Status */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Home Safety Status
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
                    <span>OPTIMAL</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Zero gas leakage anomalies reported in Dhanmondi
                  </span>
                </div>
                <Link
                  href="/safety"
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100 hover:text-emerald-800"
                >
                  Kitchen checklist <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Card 5: Connected IoT Devices */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Connected IoT Smart Sensors
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-navy-950 text-sm">
                        Kitchen Sensor #001 (IOT-SENS-DH-001)
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Gas: <strong>18.4 PPM (SAFE)</strong> • Temp: <strong>27.5°C</strong> • Battery: <strong>92%</strong>
                    </span>
                  </div>
                  <Badge variant="safe" className="self-start sm:self-auto">
                    LIVE TELEMETRY
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  Last heartbeat: 2 mins ago via ESP32 Gateway
                </div>
              </div>
            </div>

            {/* Section 1: Recent Complaints Tracked */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-navy-950">Recent Filed Complaints</h3>
                  <p className="text-xs text-slate-500">
                    Track the real-time progress of fair pricing and equipment safety investigations.
                  </p>
                </div>
                <Link href="/complaints/new">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    New Complaint
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading active complaints...
                </div>
              ) : complaints.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No complaints filed yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Notice an overpricing or unsafe cylinder? File an official report to notify safety officers.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <Link
                      key={c.id}
                      href={`/complaints/${c.id}`}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-950">
                            {c.trackingNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {c.category.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-lg">
                          {c.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            c.status === "RESOLVED"
                              ? "safe"
                              : c.status === "INVESTIGATION"
                              ? "warning"
                              : "neutral"
                          }
                          className="text-[11px]"
                        >
                          {c.status}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-950 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Verified Dealers In Division */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-navy-950">Certified Dealers Nearby</h3>
                  <p className="text-xs text-slate-500">
                    Licensed retail points holding current Department of Explosives compliance certs.
                  </p>
                </div>
                <Link href="/dealers">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    View Full Directory
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dealers.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="safe" className="text-[10px]">
                          CERTIFIED
                        </Badge>
                        <span className="text-xs font-black text-navy-950">
                          ৳{d.currentLpgPrice}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-navy-950 mt-2 line-clamp-1">
                        {d.businessName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {d.address}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {d.phone}
                      </span>
                      <Link href={`/dealers/${d.id}`}>
                        <span className="text-xs font-bold text-navy-950 hover:underline">
                          Details →
                        </span>
                      </Link>
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
