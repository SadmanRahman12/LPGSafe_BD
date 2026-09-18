import { ShieldCheck, Store, CheckSquare, MapPin } from "lucide-react";

export function TrustStats() {
  const stats = [
    {
      label: "Registered Cylinders",
      value: "14,250+",
      desc: "Tracked with unique digital QR IDs",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Certified Retail Dealers",
      value: "1,850+",
      desc: "Explosives Department licensed",
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Safety Compliance Rate",
      value: "99.4%",
      desc: "Hydrostatic test verified cylinders",
      icon: CheckSquare,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Divisions & Districts",
      value: "8 / 64",
      desc: "Nationwide coverage active",
      icon: MapPin,
      color: "text-navy-900",
      bgColor: "bg-navy-50",
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xl font-bold text-navy-950">
              National LPG Ecosystem Statistics
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated operational metrics across licensed distributors in Bangladesh
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Simulated / Demo Data System</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black text-navy-950 mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-600">{stat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
