import Link from "next/link";
import { ShieldCheck, Search, QrCode, ArrowRight, Flame, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 md:py-24 border-b border-slate-200">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute top-20 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>National Cylinder Integrity & Fair Pricing Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.15]">
              Making LPG Safer, Smarter and More Transparent in Bangladesh
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Protect your family, kitchen, and business with real-time cylinder verification, authorized retail directories, and official BERC market price monitoring.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/dealers" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white shadow-md gap-2.5">
                  <Search className="w-5 h-5 text-emerald-400" />
                  Find a Certified Dealer
                </Button>
              </Link>
              <Link href="/verify" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-emerald-600 text-emerald-800 hover:bg-emerald-50 shadow-sm gap-2.5 font-semibold"
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  Verify LPG Cylinder
                </Button>
              </Link>
            </div>

            {/* Micro assurances */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>BSTI BDS 1530:2008 Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Explosives Dept. Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>All 8 Divisions Covered</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Interactive Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50">
              {/* Header pill */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Cylinder Verification Demo
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              {/* Sample Cylinder Card */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Cylinder ID
                    </span>
                    <p className="font-mono text-base font-bold text-navy-950">
                      LPG-BD-2026-000123
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Manufacturer</span>
                    <strong className="text-slate-800">Omera Petroleum</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Capacity / Tare</span>
                    <strong className="text-slate-800">12.0 kg / 13.8 kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Next Hydro-Test</span>
                    <strong className="text-emerald-700">Nov 2028</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Current Dealer</span>
                    <strong className="text-slate-800">Gulshan-2 Depot</strong>
                  </div>
                </div>

                {/* Safety score progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Calculated Safety Score</span>
                    <span className="text-emerald-600">98.5 / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[98.5%]" />
                  </div>
                </div>
              </div>

              {/* Instant verification entry input simulation */}
              <div className="pt-1">
                <Link href="/verify?id=LPG-BD-2026-000123">
                  <Button variant="primary" size="md" className="w-full gap-2 bg-navy-900 hover:bg-navy-800 font-semibold">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Verify Your Cylinder Now
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Instant lookup against national registry • Zero app install required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
