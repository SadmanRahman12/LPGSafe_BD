import { AlertOctagon, CheckCircle2, ShieldAlert, BadgePercent, QrCode, ClipboardCheck } from "lucide-react";

export function ProblemSolutionSection() {
  const problems = [
    {
      title: "Expired & Substandard Cylinders",
      description: "Thousands of cylinders in circulation exceed their statutory 10-year lifespan without hydrostatic pressure testing, presenting severe explosion hazards.",
      icon: ShieldAlert,
    },
    {
      title: "Arbitrary Price Gouging",
      description: "Retail consumers routinely pay ৳200 to ৳400 above the monthly BERC reference tariff due to middlemen exploitation and lack of price transparency.",
      icon: BadgePercent,
    },
    {
      title: "Uncertified Retailers & Decanting",
      description: "Informal street shops without ventilation, fire extinguishers, or Explosives Department trade licenses carry out risky manual cross-decanting.",
      icon: AlertOctagon,
    },
  ];

  const solutions = [
    {
      title: "Unique QR Provenance & Lifespan Audit",
      description: "Every authorized cylinder has an unforgeable digital identity containing tare weight, test dates, batch origin, and current safety score.",
      icon: QrCode,
    },
    {
      title: "Real-time BERC Price Monitoring",
      description: "Compare your local dealer's price directly against the gazetted BERC rate, flag violations, and locate fairly priced certified shops.",
      icon: CheckCircle2,
    },
    {
      title: "Digitized Field Safety Inspections",
      description: "Certified safety officers conduct multi-point inspections on valves, regulators, and storage conditions with verifiable digital records.",
      icon: ClipboardCheck,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Why LPGSafe Bangladesh Matters
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-950 mt-2 mb-4 tracking-tight">
            Tackling Root Safety & Market Failures in Domestic LPG
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Transitioning Bangladesh's rapidly growing LPG market from an opaque risk-prone distribution chain to a digitally verified, consumer-first ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="rounded-2xl border border-red-200/80 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-red-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-950">The Current Challenges</h3>
                <p className="text-xs text-red-600 font-semibold">Unregulated practices endangering lives & wallets</p>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              {problems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 mt-1 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-navy-950">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solution Card */}
          <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-950">The LPGSafe Solution</h3>
                <p className="text-xs text-emerald-600 font-semibold">Transparent, technology-driven protection</p>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              {solutions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-1 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-navy-950">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
