import Link from "next/link";
import { ShieldAlert, Gauge, Activity, Flame, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SafetySection() {
  const safetyCards = [
    {
      title: "Check Expiry & Hydro-Test Stamp",
      desc: "Look at the inner collar stay for the quarterly stamp (e.g. A-26). Reject cylinders past their statutory test date.",
      icon: ShieldAlert,
    },
    {
      title: "Low-Pressure Regulators Only",
      desc: "Ensure 28-30 mbar BSTI certified domestic regulators. Never attach high-pressure industrial valves at home.",
      icon: Gauge,
    },
    {
      title: "Soap Solution Leak Test",
      desc: "Apply soapy water with a sponge around couplings. Never test for gas leaks using matches or open flames.",
      icon: Activity,
    },
    {
      title: "Ground-Level Airflow Placement",
      desc: "LPG is heavier than air. Keep cylinders upright in well-ventilated areas, never inside sealed cabinets.",
      icon: Flame,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Kitchen Safety Guidelines
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950 mt-2 tracking-tight">
              Essential Rules Every LPG User Must Know
            </h2>
          </div>
          <Link href="/safety">
            <Button variant="outline" className="gap-2 border-slate-300">
              Explore Full Safety Manual
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-navy-950">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Emergency Alert Bar */}
        <div className="mt-8 rounded-2xl bg-red-50 border border-red-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-950">In Case of Suspected Gas Leakage</h4>
              <p className="text-xs text-red-800">
                Do NOT touch electrical switches. Turn off regulator valve, open all doors/windows, evacuate everyone outdoors, and dial 999.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-red-600">Hotline: 999</span>
          </div>
        </div>
      </div>
    </section>
  );
}
