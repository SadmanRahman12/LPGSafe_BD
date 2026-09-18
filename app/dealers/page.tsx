"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Star,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Flame,
  Map as MapIcon,
  List,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DealersMapWrapper from "@/components/dealers/dealers-map-wrapper";

export default function DealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [division, setDivision] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [upazila, setUpazila] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");

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
    fetchDealers();
  }, [division, district, certifiedOnly]);

  const fetchDealers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (division !== "ALL") params.set("division", division);
      if (district !== "ALL") params.set("district", district);
      if (certifiedOnly) params.set("certified", "true");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/dealers?${params.toString()}`);
      const data = await res.json();
      if (data.dealers) {
        setDealers(data.dealers);
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDealers();
  };

  const filteredDealers = dealers
    .filter((d) => {
      if (upazila && !d.upazila?.toLowerCase().includes(upazila.toLowerCase())) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.businessName?.toLowerCase().includes(q) ||
        d.address?.toLowerCase().includes(q) ||
        d.upazila?.toLowerCase().includes(q) ||
        d.district?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price") return (a.currentLpgPrice || 0) - (b.currentLpgPrice || 0);
      return (a.businessName || "").localeCompare(b.businessName || "");
    });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Licensed Retail Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Find a Certified LPG Dealer Near You
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Locate authorized retail points with active Department of Explosives safety certifications, fair BERC declared pricing, and authentic cylinder stock.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-sm self-start">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "split"
                  ? "bg-navy-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-navy-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards Only</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "map"
                  ? "bg-navy-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map Only</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shop name, address, street..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-navy-950"
              />
            </div>

            {/* Division Select */}
            <div className="lg:col-span-2">
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-navy-950 bg-white"
              >
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div === "ALL" ? "All Divisions" : `${div} Division`}
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila input */}
            <div className="lg:col-span-2">
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="Filter by Upazila..."
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-navy-950"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-navy-950 bg-white"
              >
                <option value="rating">Sort: Highest Rated</option>
                <option value="price">Sort: Lowest Price</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>

            {/* Certified Only Checkbox */}
            <div className="lg:col-span-2 flex items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={certifiedOnly}
                  onChange={(e) => setCertifiedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Certified Only</span>
              </label>
            </div>
          </form>
        </div>

        {/* Interactive Map Component */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapIcon className="w-4 h-4 text-emerald-600" />
                <span>Geographic Outlet Distribution ({filteredDealers.length} mapped)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Click pins on the map for shop details
              </span>
            </div>
            <DealersMapWrapper
              dealers={filteredDealers}
              height={viewMode === "map" ? "620px" : "380px"}
            />
          </div>
        )}

        {/* Dealers Cards Grid */}
        {(viewMode === "split" || viewMode === "list") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Showing {filteredDealers.length} Verified Outlets
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600" />
                <p className="mt-3 text-xs text-slate-500 font-medium">Loading certified dealers...</p>
              </div>
            ) : filteredDealers.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <Store className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-navy-950">No Dealers Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No dealers match your filter criteria. Try expanding the division or clearing upazila filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDivision("ALL");
                    setDistrict("ALL");
                    setUpazila("");
                    setSearchQuery("");
                    setCertifiedOnly(false);
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDealers.map((dealer) => {
                  const isCertified = dealer.isCertified;
                  const googleMapsUrl =
                    dealer.latitude && dealer.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${dealer.latitude},${dealer.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          dealer.address + ", " + dealer.district
                        )}`;

                  return (
                    <div
                      key={dealer.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Status Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {dealer.division} • {dealer.upazila || dealer.district}
                            </span>
                            <h3 className="text-base font-bold text-navy-950 mt-0.5 line-clamp-1">
                              {dealer.businessName}
                            </h3>
                          </div>
                          {isCertified ? (
                            <Badge variant="safe" className="flex-shrink-0 text-[10px]">
                              <ShieldCheck className="w-3 h-3 mr-0.5" />
                              CERTIFIED
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="flex-shrink-0 text-[10px]">
                              <ShieldAlert className="w-3 h-3 mr-0.5" />
                              PENDING
                            </Badge>
                          )}
                        </div>

                        {/* Rating, Open/Closed, Distance */}
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-1 font-semibold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{dealer.rating?.toFixed(1) || "4.5"}</span>
                            <span className="text-slate-400 font-normal">
                              ({dealer.totalReviews || 24})
                            </span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Open Now
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ~1.2 km
                          </span>
                        </div>

                        {/* Address & Phone */}
                        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{dealer.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-800">{dealer.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Required 3 Action Buttons */}
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              12kg Cylinder Price
                            </span>
                            <span className="text-lg font-black text-navy-950">
                              ৳{dealer.currentLpgPrice?.toLocaleString()}
                            </span>
                          </div>
                          <Link href={`/dealers/${dealer.id}`}>
                            <Button size="sm" className="bg-navy-950 hover:bg-navy-900 text-white text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Navigation className="w-3 h-3 text-slate-500" />
                            Get Directions
                          </a>
                          <Link
                            href={`/complaints/new?dealerId=${dealer.id}`}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 transition-colors"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Report Issue
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
