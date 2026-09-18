"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Scale,
  DollarSign,
  Filter,
  Building,
  Info,
  BarChart2,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PriceChart from "@/components/prices/price-chart";

export default function PricesPage() {
  const [data, setData] = useState<any>(null);
  const [division, setDivision] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [cylinderSize, setCylinderSize] = useState("12");
  const [isLoading, setIsLoading] = useState(true);

  // Price report modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDivision, setModalDivision] = useState("Dhaka");
  const [modalDistrict, setModalDistrict] = useState("Dhaka");
  const [modalPrice, setModalPrice] = useState("1450");
  const [modalSize, setModalSize] = useState("12");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const divisions = [
    "ALL",
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Sylhet",
    "Barishal",
    "Rangpur",
    "Mymensingh",
  ];

  useEffect(() => {
    fetchPrices();
  }, [division, district, cylinderSize]);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (division !== "ALL") params.set("division", division);
      if (district !== "ALL") params.set("district", district);
      if (cylinderSize) params.set("cylinderSize", cylinderSize);

      const res = await fetch(`/api/prices?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: modalDivision,
          district: modalDistrict,
          cylinderSizeKg: parseFloat(modalSize),
          reportedPrice: parseFloat(modalPrice),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitMessage("Price observation recorded successfully!");
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitMessage(null);
          fetchPrices();
        }, 1200);
      } else {
        setSubmitMessage(json.error || "Failed to record price observation.");
      }
    } catch (err) {
      console.error("Error submitting price:", err);
      setSubmitMessage("Failed to submit price observation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Official BERC Benchmark & Transparent Market Index</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              LPG Price Monitoring & Fairness Index
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Compare retail prices against the statutory monthly reference rate declared by the Bangladesh Energy Regulatory Commission (BERC).
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs gap-1.5 self-start shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Report Local Retail Price
          </Button>
        </div>

        {/* 4 Summary Stat Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Official BERC 12kg Ceiling
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                ৳{data.stats.referencePrice?.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Declared statutory ceiling</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Average Market Price
              </span>
              <div className="text-3xl font-black text-navy-950 mt-1">
                ৳{data.stats.averagePrice?.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Based on {data.stats.totalReports} active reports</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Lowest Reported Price
              </span>
              <div className="text-3xl font-black text-emerald-700 mt-1">
                ৳{data.stats.lowestPrice?.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Competitive retail rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Highest Reported Price
              </span>
              <div className="text-3xl font-black text-rose-600 mt-1">
                ৳{data.stats.highestPrice?.toLocaleString()}
              </div>
              <span className="text-[11px] text-rose-600 font-semibold">Under regulatory review</span>
            </div>
          </div>
        )}

        {/* Recharts Price Chart */}
        {data?.chartData && (
          <PriceChart data={data.chartData} referencePrice={data.stats?.referencePrice || 1455} />
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-navy-950" />
              <span>Filter Market Data:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Cylinder Size Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Size:</span>
                {["12", "35", "45"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setCylinderSize(size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      cylinderSize === size
                        ? "bg-navy-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {size}kg
                  </button>
                ))}
              </div>

              {/* Division Pills */}
              <div className="flex flex-wrap gap-1">
                {divisions.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivision(div)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      division === div
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price Observations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-950">
              Verified Retailer Price Submissions & Observations
            </h3>
            <span className="text-xs text-slate-400">
              {data?.records?.length || 0} observations listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Dealer / Outlet</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Cylinder</th>
                  <th className="px-6 py-4 text-right">Reported Price</th>
                  <th className="px-6 py-4 text-right">BERC Benchmark</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Loading market price observations...
                    </td>
                  </tr>
                ) : data?.records?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No price reports recorded for this selection.
                    </td>
                  </tr>
                ) : (
                  data?.records?.map((rec: any) => {
                    const isViolation = rec.isViolation;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-navy-950">
                          {rec.dealer?.businessName ? (
                            <a
                              href={`/dealers/${rec.dealer.id}`}
                              className="hover:underline hover:text-emerald-700"
                            >
                              {rec.dealer.businessName}
                            </a>
                          ) : (
                            "Authorized Retail Point"
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {rec.district}, {rec.division}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {rec.cylinderSizeKg} kg LPG
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-navy-950">
                          ৳{rec.reportedPrice?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500">
                          ৳{rec.referencePrice?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isViolation ? (
                            <Badge variant="warning" className="gap-1 font-bold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Potential Price Violation
                            </Badge>
                          ) : (
                            <Badge variant="safe" className="gap-1 font-bold text-[11px]">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Compliant
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              <strong>Note on Price Violations:</strong> Flagged entries indicate prices exceeding declared benchmark thresholds. Findings are subject to administrative review and do not automatically declare legal guilt.
            </span>
          </div>
        </div>

        {/* Modal: Report Price */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-navy-950">
                  Report Local Retail Price
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Division
                  </label>
                  <select
                    value={modalDivision}
                    onChange={(e) => setModalDivision(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    {divisions
                      .filter((d) => d !== "ALL")
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    District / Town
                  </label>
                  <input
                    type="text"
                    value={modalDistrict}
                    onChange={(e) => setModalDistrict(e.target.value)}
                    placeholder="e.g. Dhaka, Bogura, Cox's Bazar..."
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Cylinder Size
                    </label>
                    <select
                      value={modalSize}
                      onChange={(e) => setModalSize(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="12">12 kg Domestic</option>
                      <option value="35">35 kg Commercial</option>
                      <option value="45">45 kg Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Charged Price (৳)
                    </label>
                    <input
                      type="number"
                      value={modalPrice}
                      onChange={(e) => setModalPrice(e.target.value)}
                      required
                      min="500"
                      max="10000"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {submitMessage && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                    {submitMessage}
                  </p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    className="bg-navy-950 text-white"
                  >
                    Submit Observation
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
