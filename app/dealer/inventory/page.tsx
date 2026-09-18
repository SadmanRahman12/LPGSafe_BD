"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft,
  DollarSign,
  Flame,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DealerInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalStock: 0, lowStockCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Add stock form
  const [newBrand, setNewBrand] = useState("Omera Petroleum");
  const [newSize, setNewSize] = useState("12");
  const [newStock, setNewStock] = useState("20");
  const [newAlert, setNewAlert] = useState("10");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Sale form
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const brandOptions = [
    "Omera Petroleum",
    "Bashundhara LP Gas",
    "Jamuna Gas",
    "Beximco Smart LPG",
    "TotalEnergies LPG",
    "BM LP Gas",
    "JMI Industrial Gas",
  ];

  const statuses = [
    "ALL",
    "IN_STOCK",
    "SOLD",
    "RESERVED",
    "RETURNED",
    "INSPECTION_REQUIRED",
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdd(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD",
          brand: newBrand,
          cylinderSizeKg: parseFloat(newSize),
          currentStock: parseInt(newStock),
          minStockAlert: parseInt(newAlert),
          status: "IN_STOCK",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        fetchInventory();
      }
    } catch (err) {
      console.error("Error adding stock:", err);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmittingSale(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SALE",
          id: selectedItem.id,
          quantity: parseInt(saleQuantity),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaleOpen(false);
        setSelectedItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error("Error recording sale:", err);
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (!searchQuery) return true;
    return item.brand.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dealer/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dealer Dashboard
            </Link>
            <h1 className="text-3xl font-black text-navy-950 tracking-tight">
              Warehouse Cylinder Stock & Inventory
            </h1>
            <p className="text-xs text-slate-500">
              Manage live inventory counts, track cylinder movements, record customer sales, and prevent stock-outs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Stock Batch
            </Button>
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Cylinders On Site
            </span>
            <div className="text-3xl font-black text-navy-950">
              {stats.totalStock} Units
            </div>
            <span className="text-xs text-slate-500">Across all domestic & commercial sizes</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Registered Brands
            </span>
            <div className="text-3xl font-black text-navy-950">
              {inventory.length} Brands
            </div>
            <span className="text-xs text-emerald-600 font-semibold">
              All batches certified under BSTI specs
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Low Stock Warnings
            </span>
            <div
              className={`text-3xl font-black ${
                stats.lowStockCount > 0 ? "text-amber-600" : "text-emerald-700"
              }`}
            >
              {stats.lowStockCount} Items
            </div>
            <span className="text-xs text-slate-500">
              {stats.lowStockCount > 0
                ? "Immediate depot reorder recommended"
                : "All brand stocks above threshold"}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
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

        {/* Stock Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="sales">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Brand / Manufacturer</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Alert Limit</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No inventory records found. Click "Add Stock Batch" to register cylinders.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minStockAlert;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-navy-950">{item.brand}</div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {item.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {item.cylinderSizeKg} kg
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-base text-navy-950">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                          {item.minStockAlert}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isLow ? (
                            <Badge variant="warning" className="gap-1 text-[10px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              LOW STOCK
                            </Badge>
                          ) : (
                            <Badge variant="safe" className="gap-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {item.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsSaleOpen(true);
                            }}
                            className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            Record Sale
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Stock */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-navy-950">
                  Receive & Register Stock Batch
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStock} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cylinder Brand
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    {brandOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Capacity Size
                    </label>
                    <select
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="12">12 kg Domestic</option>
                      <option value="35">35 kg Commercial</option>
                      <option value="45">45 kg Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Received Quantity
                    </label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      required
                      min="1"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Low-Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={newAlert}
                    onChange={(e) => setNewAlert(e.target.value)}
                    required
                    min="1"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400">
                    System will notify you when warehouse stock falls to this number.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmittingAdd}
                    className="bg-navy-950 text-white"
                  >
                    Register Stock
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Record Sale */}
        {isSaleOpen && selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-navy-950">
                  Record Cylinder Sale & Delivery
                </h3>
                <button
                  onClick={() => setIsSaleOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-navy-950">{selectedItem.brand}</div>
                <div>Size: {selectedItem.cylinderSizeKg} kg</div>
                <div>Available In Stock: {selectedItem.currentStock} units</div>
              </div>

              <form onSubmit={handleRecordSale} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Dispensed Quantity
                  </label>
                  <input
                    type="number"
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                    required
                    min="1"
                    max={selectedItem.currentStock}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSaleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmittingSale}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                  >
                    Confirm Sale
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
