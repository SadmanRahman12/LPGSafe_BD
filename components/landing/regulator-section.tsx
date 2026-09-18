import { Building2, FileCheck, Scale, ShieldCheck } from "lucide-react";

export function RegulatorSection() {
  const bodies = [
    {
      acronym: "BERC",
      name: "Bangladesh Energy Regulatory Commission",
      role: "Determines official monthly LPG maximum retail tariffs and reference pricing models across all cylinder sizes.",
      icon: Scale,
    },
    {
      acronym: "Dept. of Explosives",
      name: "Ministry of Power, Energy & Mineral Resources",
      role: "Issues retail and bulk storage licenses, enforces Gas Cylinder Rules 1991, and oversees safety compliance.",
      icon: ShieldCheck,
    },
    {
      acronym: "BSTI",
      name: "Bangladesh Standards & Testing Institution",
      role: "Mandates standard BDS 1530:2008 for cylinder wall thickness, burst tolerance, metallurgy, and valve seals.",
      icon: FileCheck,
    },
    {
      acronym: "FSCD",
      name: "Fire Service & Civil Defence",
      role: "Inspects retailer fire extinguishers, storage separation clearances, and provides emergency rescue response.",
      icon: Building2,
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Institutional Alignment
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-950 mt-2 mb-4 tracking-tight">
            Designed for Regulatory Cooperation
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            LPGSafe Bangladesh is built from the ground up to support statutory oversight, field safety audits, and automated price compliance reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bodies.map((body, i) => {
            const Icon = body.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {body.acronym}
                  </span>
                  <Icon className="w-5 h-5 text-navy-800" />
                </div>
                <h3 className="font-bold text-sm text-navy-950">{body.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{body.role}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-navy-950 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              Are you an authorized dealer or regulatory officer?
            </h4>
            <p className="text-xs text-slate-300">
              Access the digital licensing portal, schedule safety inspections, or log official BERC pricing records.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="/register?role=DEALER"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              Dealer Certification
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 transition-colors"
            >
              Inspector Portal
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
