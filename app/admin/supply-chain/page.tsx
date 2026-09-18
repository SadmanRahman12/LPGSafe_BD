"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  Building2,
  Store,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Package,
  PlusCircle,
  Database,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function SupplyChainDashboard() {
  const [data, setData] = useState<any>(null);
  const [dealers, setDealers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shipment dispatch modal state
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState("");
  const [selectedDealer, setSelectedDealer] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [quantity, setQuantity] = useState("120");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSupplyData();
  }, []);

  const fetchSupplyData = async () => {
    setIsLoading(true);
    try {
      const [scRes, dealerRes] = await Promise.all([
        fetch("/api/supply-chain").then((r) => r.json()),
        fetch("/api/dealers").then((r) => r.json()),
      ]);

      if (scRes.success) setData(scRes);
      if (dealerRes.dealers) setDealers(dealerRes.dealers);
    } catch (err) {
      console.error("Error loading supply chain data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepot || !selectedDealer || !quantity) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/supply-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDepotId: selectedDepot,
          targetDealerId: selectedDealer,
          batchNumber: batchNum,
          quantity: parseInt(quantity),
          cylinderSizeKg: 12.0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsDispatchOpen(false);
        setSelectedDepot("");
        setSelectedDealer("");
        setBatchNum("");
        fetchSupplyData();
      }
    } catch (err) {
      console.error("Dispatch shipment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = data?.summary;
  const depots = data?.depots || [];
  const distributions = data?.distributions || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </Link>
          <div className="text-xs font-mono text-slate-400">
            BERC / Explosives Department Macro Supply Telemetry
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="text-[10px] font-bold">
                NATIONAL SUPPLY CONTINUITY
              </Badge>
              <span className="text-xs text-slate-400">Coastal Terminals & Inland Hubs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
              National LPG Supply Chain Surveillance
            </h1>
            <p className="text-xs text-slate-500">
              End-to-end provenance monitoring from marine import terminals through distribution depots to consumer retail points.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchSupplyData}
              className="text-xs gap-1.5 border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Feed
            </Button>
            <Button
              size="sm"
              onClick={() => setIsDispatchOpen(true)}
              className="bg-navy-950 hover:bg-navy-900 text-white text-xs gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Batch Dispatch
            </Button>
          </div>
        </div>

        {/* 5-Step Macro Flow Diagram */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-950">
              Downstream Petroleum Logistics Architecture
            </h3>
            <span className="text-[11px] text-slate-400">
              Gas Cylinder Rules 1991 Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-navy-950">1. Importer / Refinery</h4>
              <p className="text-[11px] text-slate-500">Marine terminals at Chittagong & Mongla ports</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-emerald-950">2. Regional Depot</h4>
              <p className="text-[11px] text-emerald-700">High-capacity bulk spherical storage</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-800 mx-auto flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-navy-950">3. Distribution</h4>
              <p className="text-[11px] text-slate-500">Bulk cylinder transport fleet</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-blue-950">4. Certified Dealer</h4>
              <p className="text-[11px] text-blue-700">Explosives-licensed retail storefronts</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-navy-950">5. Domestic Consumer</h4>
              <p className="text-[11px] text-slate-500">Safe kitchen delivery & verification</p>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Storage Capacity
              </span>
              <div className="text-2xl font-black text-navy-950">
                {summary.totalCapacityMetricTons?.toLocaleString()} MT
              </div>
              <span className="text-xs text-slate-500">Across licensed bulk terminals</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Current Stock In Reserve
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {summary.currentStockMetricTons?.toLocaleString()} MT
              </div>
              <span className="text-xs text-emerald-700 font-semibold">
                {summary.utilizationRate}% tank capacity
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Active Shipments In Transit
              </span>
              <div className="text-2xl font-black text-blue-600">
                {summary.activeShipments} Batches
              </div>
              <span className="text-xs text-slate-500">En route to divisional outlets</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Low Stock Dealer Warnings
              </span>
              <div className="text-2xl font-black text-amber-600">
                {summary.lowStockOutletsCount} Outlets
              </div>
              <span className="text-xs text-amber-700">Stock &le; threshold alert</span>
            </div>
          </div>
        )}

        {/* Depots Inventory & Capacity Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950">
                Strategic Regional Supply Depots
              </h3>
              <p className="text-xs text-slate-500">
                Current bulk inventory levels and dispatch throughput.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Metric Tons (MT)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {depots.map((depot: any) => {
              const pct = Math.round((depot.currentStockMetricTons / depot.capacityMetricTons) * 100);
              return (
                <div
                  key={depot.id}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {depot.code}
                      </span>
                      <h4 className="text-base font-bold text-navy-950 mt-1">
                        {depot.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {depot.address}, {depot.division}
                      </p>
                    </div>
                    <Badge variant="safe" className="text-[10px]">
                      OPERATIONAL
                    </Badge>
                  </div>

                  {/* Meter Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Bulk Level: {pct}%</span>
                      <span className="text-navy-950 font-mono">
                        {depot.currentStockMetricTons.toLocaleString()} /{" "}
                        {depot.capacityMetricTons.toLocaleString()} MT
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct < 25 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span>Officer: <strong>{depot.contactPerson}</strong></span>
                    <span>Phone: <strong>{depot.contactPhone}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Distributions Log */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950">
                Batch Distribution & Transit Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Verifiable custody records from regional depot dispatch to dealership receipt.
              </p>
            </div>
            <span className="text-xs text-slate-400">Recent {distributions.length} Shipments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Batch Number</th>
                  <th className="py-3 px-3">Source Depot</th>
                  <th className="py-3 px-3">Target Retailer</th>
                  <th className="py-3 px-3">Volume</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Dispatch Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributions.map((dist: any) => (
                  <tr key={dist.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-navy-950">
                      {dist.batchNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {dist.sourceDepot?.name}
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-navy-950 block">{dist.targetDealer?.businessName}</strong>
                      <span className="text-[11px] text-slate-400">
                        {dist.targetDealer?.district}, {dist.targetDealer?.division}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-navy-950">
                      {dist.quantity} cylinders ({dist.cylinderSizeKg}kg)
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          dist.status === "DELIVERED"
                            ? "safe"
                            : dist.status === "IN_TRANSIT"
                            ? "warning"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {dist.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatDate(dist.dispatchDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Dispatch Shipment */}
        {isDispatchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <h3 className="text-lg font-black text-navy-950">Log Official Depot Dispatch</h3>
              <form onSubmit={handleDispatch} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Source Depot</label>
                  <select
                    value={selectedDepot}
                    onChange={(e) => setSelectedDepot(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="">-- Choose Origin Depot --</option>
                    {depots.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.division})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Dealer</label>
                  <select
                    value={selectedDealer}
                    onChange={(e) => setSelectedDealer(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="">-- Choose Destination Dealer --</option>
                    {dealers.map((dl: any) => (
                      <option key={dl.id} value={dl.id}>
                        {dl.businessName} ({dl.division} • {dl.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Batch Identifier</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if blank"
                      value={batchNum}
                      onChange={(e) => setBatchNum(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (Cylinders)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDispatchOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting} className="bg-navy-950 text-white">
                    {isSubmitting ? "Logging..." : "Confirm Shipment Dispatch"}
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
