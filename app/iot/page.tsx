"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Wifi,
  BatteryCharging,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Bell,
  Activity,
  Code2,
  Zap,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function IoTSimulationHub() {
  const [devices, setDevices] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [selectedSerial, setSelectedSerial] = useState("IOT-SENS-DH-001");
  const [simulatedPpm, setSimulatedPpm] = useState(18.4);
  const [simulatedTemp, setSimulatedTemp] = useState(27.5);
  const [simulatedBattery, setSimulatedBattery] = useState(92);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [audioSiren, setAudioSiren] = useState(true);

  useEffect(() => {
    fetchIoTTelemetry();
  }, []);

  const fetchIoTTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/iot");
      const data = await res.json();
      if (data.success) {
        setDevices(data.devices || []);
        setActiveAlerts(data.alerts || []);
        if (data.devices?.length > 0) {
          const dev = data.devices.find((d: any) => d.deviceSerial === selectedSerial) || data.devices[0];
          setSimulatedPpm(dev.gasLevelPpm);
          setSimulatedTemp(dev.temperatureC);
          setSimulatedBattery(dev.batteryLevel);
        }
      }
    } catch (err) {
      console.error("Error loading IoT telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTelemetry = async (ppm: number, temp: number, batt: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceSerial: selectedSerial,
          gasLevelPpm: ppm,
          temperatureC: temp,
          batteryLevel: batt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchIoTTelemetry();
      }
    } catch (err) {
      console.error("Error transmitting sensor telemetry:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreset = (preset: "NORMAL" | "WARNING" | "CRITICAL") => {
    let ppm = 18.0;
    let temp = 27.0;
    if (preset === "WARNING") {
      ppm = 135.0;
      temp = 32.0;
    } else if (preset === "CRITICAL") {
      ppm = 340.0;
      temp = 36.5;
    }
    setSimulatedPpm(ppm);
    setSimulatedTemp(temp);
    sendTelemetry(ppm, temp, simulatedBattery);
  };

  const handleResolve = async (alertId: string) => {
    try {
      await fetch("/api/iot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolvedNotes: "Resolved manually in simulation bay." }),
      });
      fetchIoTTelemetry();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  const isLeakageActive = simulatedPpm >= 250 || activeAlerts.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Emergency Leakage Siren Banner */}
        {isLeakageActive && (
          <div className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 p-6 sm:p-8 text-white shadow-2xl shadow-red-600/30 animate-pulse-slow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-200 block">
                    STATUTORY CRITICAL SAFETY TRIP ACTIVATED
                  </span>
                  <h2 className="text-2xl font-black">
                    LPG Leakage Detected! Siren Alarm Online
                  </h2>
                  <p className="text-xs text-red-100 mt-0.5">
                    Deterministic threshold exceeded (&ge; 250 PPM). Physical gas shutoff trigger fired.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setAudioSiren(!audioSiren)}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs gap-1.5"
                >
                  {audioSiren ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {audioSiren ? "Siren Active" : "Muted"}
                </Button>
                {activeAlerts[0] && (
                  <Button
                    size="sm"
                    onClick={() => handleResolve(activeAlerts[0].id)}
                    className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs"
                  >
                    Reset & Silence Trip
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>ESP32 & MQ-5 Gas Telemetry Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
              IoT Sensor Simulation & Telemetry Center
            </h1>
            <p className="text-xs text-slate-500">
              Live streaming simulation for kitchen sensors, retail cylinder storage yards, and automated emergency shutoff triggers.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchIoTTelemetry}
            className="text-xs gap-1.5 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Poll Telemetry
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Live Telemetry Unit Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy-950 text-white flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-navy-950">
                      Kitchen Sensor #001
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Serial: {selectedSerial} • Dhaka Dhanmondi Bay
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    simulatedPpm >= 250
                      ? "danger"
                      : simulatedPpm >= 100
                      ? "warning"
                      : "safe"
                  }
                  className="text-xs font-bold px-3 py-1"
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-ping mr-1.5" />
                  {simulatedPpm >= 250 ? "CRITICAL LEAK" : simulatedPpm >= 100 ? "WARNING" : "ONLINE"}
                </Badge>
              </div>

              {/* 3 Physical Metric Gauges */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    simulatedPpm >= 250
                      ? "bg-red-50 border-red-200 text-red-950"
                      : simulatedPpm >= 100
                      ? "bg-amber-50 border-amber-200 text-amber-950"
                      : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Gas Level (PPM)
                  </span>
                  <div className="text-3xl font-black mt-1 font-mono">
                    {simulatedPpm.toFixed(1)}
                  </div>
                  <span className="text-xs font-bold block mt-0.5">
                    {simulatedPpm >= 250 ? "DANGER" : simulatedPpm >= 100 ? "ELEVATED" : "SAFE"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center text-blue-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    Ambient Temp
                  </span>
                  <div className="text-3xl font-black mt-1 font-mono">
                    {simulatedTemp.toFixed(1)}°C
                  </div>
                  <span className="text-xs font-semibold text-blue-700 block mt-0.5">
                    {simulatedTemp > 35 ? "High Heat" : "Normal Room"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Battery Cell
                  </span>
                  <div className="text-3xl font-black mt-1 font-mono">
                    {simulatedBattery}%
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                    Li-ion Good
                  </span>
                </div>
              </div>

              {/* Telemetry metadata footer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Deterministic Trip Threshold: <strong>250 PPM</strong></span>
                <span>Heartbeat: <strong>Live Streaming</strong></span>
              </div>
            </div>

            {/* Hardware Microcontroller Integration Guide */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Code2 className="w-5 h-5 text-navy-950" />
                <h3 className="font-bold text-sm text-navy-950">
                  ESP32 & Arduino Hardware REST Ingestion API
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect physical ESP32 or ESP8266 microcontrollers with MQ-2 / MQ-5 gas sensor modules. Point your HTTP POST client to:
              </p>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                POST http://YOUR-DOMAIN/api/iot
                <br />
                {JSON.stringify(
                  {
                    deviceSerial: "IOT-SENS-DH-001",
                    gasLevelPpm: 18.5,
                    temperatureC: 27.2,
                    batteryLevel: 94,
                  },
                  null,
                  2
                )}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Simulation Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-navy-950">
                    Live Telemetry Injector
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Simulate hazardous micro-leaks, rapid pressure changes, or normal baseline air quality.
                </p>
              </div>

              {/* 3 Instant Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Quick Simulation Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreset("NORMAL")}
                    className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs text-center transition-all"
                  >
                    1. Normal Air
                    <span className="text-[10px] block font-normal text-emerald-700">18 PPM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset("WARNING")}
                    className="p-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs text-center transition-all"
                  >
                    2. Slow Leak
                    <span className="text-[10px] block font-normal text-amber-700">135 PPM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset("CRITICAL")}
                    className="p-3 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-950 font-bold text-xs text-center transition-all"
                  >
                    3. Blast Hazard
                    <span className="text-[10px] block font-normal text-red-700">340 PPM</span>
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Gas Concentration:</span>
                    <span className="font-mono text-navy-950">{simulatedPpm} PPM</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={simulatedPpm}
                    onChange={(e) => setSimulatedPpm(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 accent-navy-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Ambient Temperature:</span>
                    <span className="font-mono text-navy-950">{simulatedTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="0.5"
                    value={simulatedTemp}
                    onChange={(e) => setSimulatedTemp(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Battery Charge:</span>
                    <span className="font-mono text-navy-950">{simulatedBattery}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={simulatedBattery}
                    onChange={(e) => setSimulatedBattery(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                onClick={() => sendTelemetry(simulatedPpm, simulatedTemp, simulatedBattery)}
                disabled={isUpdating}
                className="w-full bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs gap-2 py-3"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                {isUpdating ? "Transmitting..." : "Send Real-Time Telemetry Payload"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
