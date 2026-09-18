"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, User, Store, Search, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "DEALER" ? "DEALER" : searchParams.get("role") === "INSPECTOR" ? "INSPECTOR" : "CONSUMER";

  const [role, setRole] = useState<"CONSUMER" | "DEALER" | "INSPECTOR">(initialRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "",
    address: "",
    businessName: "",
    tradeLicense: "",
    badgeNumber: "",
    department: "Department of Explosives",
    designation: "Field Safety Officer",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const divisions = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Sylhet",
    "Barishal",
    "Rangpur",
    "Mymensingh",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to complete registration");
        setIsLoading(false);
      } else {
        setSuccessMsg(data.message || "Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-950 text-white shadow-md mb-2">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-navy-950 tracking-tight">
          Create an LPGSafe Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join the national safety and transparent pricing network
        </p>
      </div>

      {/* Role Segmented Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setRole("CONSUMER")}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            role === "CONSUMER"
              ? "bg-white text-navy-950 shadow-sm"
              : "text-slate-600 hover:text-navy-950"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Consumer
        </button>
        <button
          type="button"
          onClick={() => setRole("DEALER")}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            role === "DEALER"
              ? "bg-white text-navy-950 shadow-sm"
              : "text-slate-600 hover:text-navy-950"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Dealer
        </button>
        <button
          type="button"
          onClick={() => setRole("INSPECTOR")}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            role === "INSPECTOR"
              ? "bg-white text-navy-950 shadow-sm"
              : "text-slate-600 hover:text-navy-950"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Inspector
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Common fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="name"
            name="name"
            label={role === "DEALER" ? "Owner / Manager Name" : role === "INSPECTOR" ? "Officer Name" : "Full Name"}
            placeholder="e.g. Tariqul Islam"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            id="phone"
            name="phone"
            label="Contact Phone"
            placeholder="e.g. +8801711000000"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password (min 6 chars)"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Role specific fields */}
        {role === "DEALER" && (
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="businessName"
                name="businessName"
                label="Dealership / Shop Name"
                placeholder="e.g. Padma LPG Point"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <Input
                id="tradeLicense"
                name="tradeLicense"
                label="Trade License Number"
                placeholder="e.g. TR-DCC-2024-12345"
                value={formData.tradeLicense}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              id="upazila"
              name="upazila"
              label="Upazila / Thana"
              placeholder="e.g. Gulshan / Dhanmondi"
              value={formData.upazila}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {role === "INSPECTOR" && (
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="badgeNumber"
                name="badgeNumber"
                label="Official Badge Number"
                placeholder="e.g. EXP-DH-2024-0012"
                value={formData.badgeNumber}
                onChange={handleChange}
                required
              />
              <Input
                id="department"
                name="department"
                label="Department"
                placeholder="Department of Explosives"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              id="designation"
              name="designation"
              label="Official Designation"
              placeholder="e.g. Senior Safety Officer"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Division & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="division" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Division
            </label>
            <select
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-900 focus:outline-none"
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="district"
            name="district"
            label="District"
            placeholder="e.g. Dhaka / Chattogram"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          id="address"
          name="address"
          label="Street Address"
          placeholder="e.g. Road 12, Sector 4"
          value={formData.address}
          onChange={handleChange}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-2"
        >
          Create {role === "CONSUMER" ? "Consumer" : role === "DEALER" ? "Dealer" : "Inspector"} Account
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-navy-950 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading registration form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
