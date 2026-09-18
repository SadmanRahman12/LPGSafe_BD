import Link from "next/link";
import { Shield, Phone, AlertTriangle, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white pt-14 pb-8 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">
                LPGSafe<span className="text-emerald-400">BD</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pr-6">
              Empowering consumers, certified dealers, safety inspectors, and regulators with real-time cylinder authenticity verification, fair price transparency, and safety assurance across Bangladesh.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-900 border border-navy-800 text-emerald-400 font-semibold">
                BSTI BDS 1530:2008
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-900 border border-navy-800 text-slate-300 font-semibold">
                Explosives Act 1884
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Public Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/dealers" className="hover:text-emerald-400 transition-colors">
                  Certified Dealer Directory
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-emerald-400 transition-colors">
                  Verify Cylinder QR / ID
                </Link>
              </li>
              <li>
                <Link href="/prices" className="hover:text-emerald-400 transition-colors">
                  BERC Price Benchmark
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-emerald-400 transition-colors">
                  Kitchen Safety Protocols
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholder Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Stakeholders
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Consumer Portal
                </Link>
              </li>
              <li>
                <Link href="/register?role=DEALER" className="hover:text-emerald-400 transition-colors">
                  Dealer Enrollment
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Field Inspector Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Regulator & Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* National Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-900/80">
                <p className="font-bold text-white flex items-center justify-between">
                  <span>National Emergency</span>
                  <span className="text-emerald-400 text-sm">999</span>
                </p>
                <p className="text-[11px] text-slate-400">Police, Ambulance, Emergency Rescue</p>
              </div>
              <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
                <p className="font-bold text-white flex items-center justify-between">
                  <span>Fire Service & Civil Defence</span>
                  <span className="text-emerald-400 text-sm">16163</span>
                </p>
                <p className="text-[11px] text-slate-400">Gas leaks, fire outbreak, rescue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="border-t border-navy-900 pt-6 pb-4">
          <div className="rounded-xl bg-navy-900/50 p-4 border border-navy-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-amber-400 font-semibold block mb-1">
              Safety & Regulatory Disclaimer:
            </strong>
            LPGSafe Bangladesh is a digital monitoring, verification, and decision-support platform designed to assist consumers, authorized retailers, safety inspectors, and energy regulators. It does NOT replace official emergency response teams. In the event of an active gas smell, fire, or immediate structural danger, evacuate immediately to an open outdoor space and dial <strong>999</strong> or <strong>16163</strong>. AI-assisted risk indicators and anomaly flags represent advisory decision-support metrics only.
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-navy-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 LPGSafe Bangladesh. Built for public safety and fair market transparency.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400">● Demo Data System</span>
            <span>All 8 Divisions Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
