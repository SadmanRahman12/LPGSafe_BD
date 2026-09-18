"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Gauge,
  Activity,
  Box,
  Wrench,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafetyPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = [
    { id: "ALL", label: "All Safety Protocols", icon: Info },
    { id: "CYLINDER", label: "Cylinder Safety", icon: ShieldAlert },
    { id: "REGULATOR", label: "Regulator Safety", icon: Gauge },
    { id: "LEAK", label: "Leak Detection", icon: Activity },
    { id: "STORAGE", label: "Storage Guidelines", icon: Box },
    { id: "INSTALLATION", label: "Installation Clearance", icon: Wrench },
    { id: "EMERGENCY", label: "Emergency Response", icon: PhoneCall },
  ];

  const safetyItems = [
    {
      category: "CYLINDER",
      categoryName: "Cylinder Safety",
      title: "Identifying Hydrostatic Expiry Dates on the Collar Stay",
      summary: "Every certified cylinder in Bangladesh has its re-testing quarter stamped on the inner stay collar.",
      icon: ShieldAlert,
      dos: [
        "Inspect the quarterly code: 'A' (Jan-Mar), 'B' (Apr-Jun), 'C' (Jul-Sep), 'D' (Oct-Dec) followed by the year (e.g. 'A-28').",
        "Refuse delivery of any cylinder where the test date is in the past.",
        "Check that the tare weight stamped on the neck collar matches the cylinder base.",
      ],
      donts: [
        "Never accept cylinders with heavy rust pits, dents exceeding 3mm, or neck weld repairs.",
        "Never roll or slide cylinders horizontally across concrete or brick pavements.",
      ],
    },
    {
      category: "REGULATOR",
      categoryName: "Regulator Safety",
      title: "Low-Pressure vs High-Pressure Domestic Stoves",
      summary: "Domestic cooking burners require 28-30 mbar low-pressure certified regulators (BSTI BDS 1530:2008 compliant).",
      icon: Gauge,
      dos: [
        "Switch the regulator knob to the full vertical 'OFF' position before attaching or detaching.",
        "Ensure the rubber O-ring seal inside the cylinder valve is intact and pliable before snapping the regulator in place.",
        "Replace old regulators every 4 to 5 years even if functioning normally.",
      ],
      donts: [
        "Never use commercial high-pressure red/bronze rotary regulators on domestic home stoves.",
        "Never hammer, pry, or force a stuck regulator latch with pliers.",
      ],
    },
    {
      category: "LEAK",
      categoryName: "Leak Detection",
      title: "The Soap Solution Test & Mercaptan Odor Detection",
      summary: "LPG is naturally odorless; ethyl mercaptan is added to impart a pungent rotten-cabbage smell.",
      icon: Activity,
      dos: [
        "Apply liquid soap-water solution with a sponge or brush along the valve neck, regulator nozzle, and rubber hose joints.",
        "Watch for expanding bubbles which signify an active pressurized leak.",
        "If you smell gas, immediately turn the cylinder regulator knob clockwise to the 'OFF' position.",
      ],
      donts: [
        "CRITICAL: NEVER use a matchstick, candle, or lighter to search for gas leaks.",
        "NEVER touch electrical switches, wall sockets, exhaust fans, or doorbells if gas smell is detected.",
      ],
    },
    {
      category: "STORAGE",
      categoryName: "Storage",
      title: "Ground-Level Airflow & Prevention of Gas Pooling",
      summary: "LPG vapor is nearly twice as dense as air. In case of a leak, it hugs the floor and settles into basement voids.",
      icon: Box,
      dos: [
        "Always store cylinders in an upright, vertical position on a flat, dry, level floor.",
        "Ensure lower-wall air ventilation grills exist in the kitchen to allow gas dissipation.",
        "Keep spare cylinders in an open, covered outdoor balcony or naturally ventilated area.",
      ],
      donts: [
        "Never store spare cylinders inside enclosed wooden cabinets, underneath sinks, or underground basements.",
        "Never place cylinders near electric generators, direct radiant heaters, or open electrical junction boxes.",
      ],
    },
    {
      category: "INSTALLATION",
      categoryName: "Installation",
      title: "Distance Clearances & Steel-Wire Reinforced Hose Specs",
      summary: "Maintain safe clearances between the open burner flame and the pressurized cylinder vessel.",
      icon: Wrench,
      dos: [
        "Keep a minimum horizontal distance of 1 meter (approx. 3.3 feet) between the stove burner and the cylinder.",
        "Use BSTI approved, steel-wire braided orange rubber hose with genuine hose clamps on both ends.",
        "Replace flexible gas hoses every 2 years or immediately upon noticing surface micro-cracks.",
      ],
      donts: [
        "Never route rubber hoses directly behind or underneath the hot burner cooking surface.",
        "Never wrap electrical wires, extension cords, or internet cables around LPG gas lines.",
      ],
    },
    {
      category: "EMERGENCY",
      categoryName: "Emergency Response",
      title: "Evacuation Protocol & Bangladesh National Rescue Hotlines",
      summary: "Sequential emergency procedures when severe gas leakage or fire occurs.",
      icon: PhoneCall,
      dos: [
        "Step 1: Evacuate all family members, children, and elderly outside to fresh air immediately.",
        "Step 2: Turn off the cylinder regulator switch ONLY if you can reach it without passing through flames.",
        "Step 3: Open all exterior windows and doors widely to allow maximum natural airflow.",
        "Step 4: Once outdoors at a safe distance, call National Emergency 999 or Fire Service 16163.",
      ],
      donts: [
        "NEVER operate any electrical switch, refrigerator door, mobile phone, or battery flashlight inside the gas zone.",
        "NEVER use elevators in a multi-story apartment during a gas leak emergency; use staircases.",
      ],
    },
  ];

  const filteredItems =
    activeCategory === "ALL"
      ? safetyItems
      : safetyItems.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>National LPG Kitchen Safety Manual</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
            LPG Safety Guidelines & Emergency Response
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Standard operating procedures based on BSTI BDS 1530:2008 and Bangladesh Department of Explosives Gas Cylinder Rules.
          </p>
        </div>

        {/* Emergency Contacts Banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white p-6 sm:p-8 shadow-lg shadow-red-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-white">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                Emergency Lifeline Numbers
              </div>
              <h2 className="text-2xl font-black">
                Fire Service & Emergency Response Hotlines
              </h2>
              <p className="text-xs text-red-100 max-w-xl">
                In case of active fire or uncontrolled gas emission, immediately evacuate outdoors and call these 24/7 emergency dispatch centers.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-white text-navy-950 px-6 py-3.5 rounded-xl shadow-md text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  National Emergency
                </span>
                <span className="text-3xl font-black text-red-600">999</span>
              </div>
              <div className="bg-white text-navy-950 px-6 py-3.5 rounded-xl shadow-md text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Fire & Civil Defence
                </span>
                <span className="text-3xl font-black text-red-600">16163</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pill Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-navy-950 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Safety Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.categoryName}
                    </span>
                    <h3 className="text-lg font-bold text-navy-950 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Do's & Don'ts */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended Safe Practices (Do's)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-5 list-disc marker:text-emerald-500">
                      {item.dos.map((d, i) => (
                        <li key={i} className="leading-relaxed">{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Dangerous Hazards to Avoid (Don'ts)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-5 list-disc marker:text-red-500">
                      {item.donts.map((dn, i) => (
                        <li key={i} className="leading-relaxed">{dn}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Safety Notice */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            Statutory Legal Notice & Platform Limitation
          </div>
          <p>
            LPGSafe Bangladesh is an informational safety advisory and digital compliance registry platform. It is not an emergency dispatch agency. In the event of gas asphyxiation, explosion risk, or structural fire, always prioritize personal and public evacuation before notifying the official state emergency services via <strong>999</strong> or <strong>16163</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
