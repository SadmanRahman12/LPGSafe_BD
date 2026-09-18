"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ComplaintFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDealerId = searchParams.get("dealerId") || "";

  const [dealers, setDealers] = useState<any[]>([]);
  const [category, setCategory] = useState("OVERPRICING");
  const [dealerId, setDealerId] = useState(initialDealerId);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dealers")
      .then((r) => r.json())
      .then((data) => {
        if (data.dealers) setDealers(data.dealers);
      })
      .catch((err) => console.error("Error loading dealers for complaint:", err));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation: Size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo size must be 5MB or less.");
      return;
    }

    // Type validation
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (description.trim().length < 10) {
      setFormError("Please provide at least 10 characters in the description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          dealerId: dealerId || null,
          location,
          description,
          severity,
          photoUrl: photoPreview,
        }),
      });

      const data = await res.json();
      if (data.success && data.complaint) {
        router.push(`/complaints/${data.complaint.id}`);
      } else {
        setFormError(data.error || "Failed to submit grievance report.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("Server connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Grievance Registry
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Official Incident Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
            Lodge a Safety or Pricing Grievance
          </h1>
          <p className="text-xs text-slate-500">
            Reports are forwarded to field inspectors at the Department of Explosives and BERC monitoring teams.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="text-xs font-bold text-navy-950 block mb-1">
              Grievance Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-navy-950"
            >
              <option value="OVERPRICING">Overpricing (Exceeding BERC Ceiling)</option>
              <option value="GAS_LEAKAGE">Gas Leakage or Damaged Valve</option>
              <option value="DAMAGED_CYLINDER">Physical Cylinder Damage / Severe Corrosion</option>
              <option value="UNSAFE_INSTALLATION">Unsafe Kitchen / Stove Installation</option>
              <option value="POOR_EQUIPMENT">Counterfeit / Substandard Regulator or Hose</option>
              <option value="UNLICENSED_DEALER">Unlicensed / Illegal Decanting Point</option>
              <option value="OTHER">Other Safety Concern</option>
            </select>
          </div>

          {/* Dealer Dropdown */}
          <div>
            <label className="text-xs font-bold text-navy-950 block mb-1">
              Associated Retail Outlet / Dealer (Optional)
            </label>
            <select
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-navy-950"
            >
              <option value="">-- Select Retailer if Known --</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.businessName} ({d.district}, {d.division})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Leave blank if reporting an unlicensed mobile seller or unknown depot.
            </span>
          </div>

          {/* Location & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-navy-950 block mb-1">
                Incident Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Dhanmondi Road 7A, Dhaka"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-navy-950"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy-950 block mb-1">
                Risk / Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-navy-950"
              >
                <option value="LOW">Low (Pricing dispute / Missing receipt)</option>
                <option value="MEDIUM">Medium (Minor leakage / Substandard hose)</option>
                <option value="HIGH">High (Active hissed leak / Counterfeit seal)</option>
                <option value="CRITICAL">Critical (Immediate fire hazard / Valve rupture)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-navy-950 block mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the defect, price charged, receipt details, or safety violation..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-navy-950 leading-relaxed"
            />
          </div>

          {/* Photo Evidence Upload with validation */}
          <div>
            <label className="text-xs font-bold text-navy-950 block mb-1">
              Photo / Memo Evidence (Optional, max 5MB)
            </label>

            {photoPreview ? (
              <div className="relative inline-block border border-slate-200 rounded-2xl p-2 bg-slate-50">
                <img
                  src={photoPreview}
                  alt="Evidence Preview"
                  className="w-48 h-32 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  id="evidence-file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-file"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-navy-950">
                    Click to upload photo evidence or receipt memo
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Accepts PNG, JPG, or WebP up to 5MB
                  </span>
                </label>
              </div>
            )}

            {photoError && (
              <p className="text-xs text-red-600 mt-1.5 font-semibold">{photoError}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 max-w-sm">
              Filing false or defamatory reports is prohibited. All reports create an audit trace.
            </p>

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-8"
            >
              Submit Grievance Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewComplaintPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading form...</div>}>
        <ComplaintFormContent />
      </Suspense>
    </div>
  );
}
