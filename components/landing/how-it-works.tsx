import { Factory, Truck, Store, Smartphone } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Bottling & Safety Testing",
      description: "Each cylinder undergoes tare weight recording, hydrostatic pressure testing, and receives a digital registry ID.",
      icon: Factory,
    },
    {
      step: "02",
      title: "Authorized Depot Dispatch",
      description: "Secure batch records track movements from coastal terminals to regional distribution hubs across Bangladesh.",
      icon: Truck,
    },
    {
      step: "03",
      title: "Licensed Dealer Verification",
      description: "Only retail shops passing physical safety inspections (ventilation, fire extinguisher) receive active certification.",
      icon: Store,
    },
    {
      step: "04",
      title: "Instant Consumer Verification",
      description: "Consumers scan the QR code on delivery to immediately confirm authenticity, safety score, and fair BERC price.",
      icon: Smartphone,
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            End-to-End Assurance
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-950 mt-2 mb-4 tracking-tight">
            How LPGSafe Secures the Supply Chain
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From the refinery bottling plant straight to your kitchen stove — full traceability in four simple stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200/80 bg-slate-50/40 p-6 hover:bg-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-slate-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
