import { Cpu, Wifi, BatteryCharging, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function IoTSection() {
  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen IoT Gas Telemetry</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight leading-tight">
              Real-Time Kitchen Gas Leak Detection & Smart Alerts
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              LPGSafe includes early telemetry prototypes built for ESP32 and MQ-series LPG sensors. Monitor cylinder gas concentration (PPM), ambient ambient temperature, and battery life directly from the cloud.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                  ✓
                </div>
                <span>Deterministic safety trip: Immediate siren alarm when gas &gt; 250 PPM</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                  ✓
                </div>
                <span>Battery & Wi-Fi heartbeat monitor with automated offline warnings</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                  ✓
                </div>
                <span>Ready for ESP32 microcontrollers and commercial dealer telemetry bays</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Simulated IoT Device Display Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-950 text-white flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-navy-950">Kitchen Sensor #001</h4>
                    <p className="text-[11px] text-slate-400">Model: ESP32-MQ5-BD • Dhanmondi</p>
                  </div>
                </div>
                <Badge variant="safe" className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </Badge>
              </div>

              {/* 3 Telemetry Gauges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Gas Level
                  </span>
                  <div className="text-xl font-black text-emerald-700 mt-1">SAFE</div>
                  <span className="text-[10px] text-emerald-600 font-mono">18.4 PPM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">
                    Ambient Temp
                  </span>
                  <div className="text-xl font-black text-blue-700 mt-1">27.5°C</div>
                  <span className="text-[10px] text-blue-600">Optimal</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    Battery
                  </span>
                  <div className="text-xl font-black text-navy-950 mt-1">92%</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Good</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
                <span>Last Telemetry Sync: <strong>Just now</strong></span>
                <span className="text-[11px] font-mono text-slate-400">ID: IOT-SENS-DH-001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
