"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  Activity,
  Cpu,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ShieldAlert,
  Zap,
  Eye,
  Settings,
  Play,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

// ── Demo / synthetic chart data ───────────────────────────────────────────────

const RISK_TREND_DATA = [
  { month: "Apr", highRisk: 12, medium: 28, low: 60 },
  { month: "May", highRisk: 9,  medium: 31, low: 60 },
  { month: "Jun", highRisk: 15, medium: 25, low: 60 },
  { month: "Jul", highRisk: 11, medium: 29, low: 60 },
  { month: "Aug", highRisk: 8,  medium: 27, low: 65 },
  { month: "Sep", highRisk: 6,  medium: 24, low: 70 },
];

const PRICE_ANOMALY_DATA = [
  { week: "W1", anomalies: 3, reviewed: 3,  actionTaken: 1 },
  { week: "W2", anomalies: 7, reviewed: 6,  actionTaken: 2 },
  { week: "W3", anomalies: 2, reviewed: 2,  actionTaken: 0 },
  { week: "W4", anomalies: 5, reviewed: 4,  actionTaken: 2 },
  { week: "W5", anomalies: 9, reviewed: 8,  actionTaken: 3 },
  { week: "W6", anomalies: 4, reviewed: 4,  actionTaken: 1 },
];

const DEMAND_FORECAST_DATA = [
  { week: "W1", actual: 48200, predicted: 47800 },
  { week: "W2", actual: 51400, predicted: 50900 },
  { week: "W3", actual: 49600, predicted: 50200 },
  { week: "W4", actual: 53100, predicted: 52700 },
  { week: "W5", actual: null,  predicted: 54200 },
  { week: "W6", actual: null,  predicted: 55800 },
];

const TOP_RISK_FACTORS = [
  { factor: "Expired certification",          count: 23, pct: 38 },
  { factor: "Multiple inspection failures",   count: 18, pct: 30 },
  { factor: "Leakage complaints on record",   count: 14, pct: 23 },
  { factor: "No fire safety equipment",       count: 11, pct: 18 },
  { factor: "Regulator in poor condition",    count: 9,  pct: 15 },
  { factor: "Inspection overdue (>1 year)",   count: 7,  pct: 12 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusDot({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
        available ? "bg-emerald-400 animate-pulse" : "bg-red-400"
      }`}
    />
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}
    >
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {href && <ChevronRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIDashboard() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [mlAvailable, setMlAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ALERTS" | "PREDICTIONS">("OVERVIEW");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [alertsRes, modelsRes] = await Promise.all([
        fetch("/api/ai/alerts").then((r) => r.json()),
        fetch("/api/ai/models").then((r) => r.json()),
      ]);
      if (alertsRes.success) setAlerts(alertsRes);
      if (modelsRes.success) {
        setModels(modelsRes.models || []);
        setMlAvailable(modelsRes.mlServiceAvailable || false);
      }
    } catch (err) {
      console.error("Error loading AI dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = alerts?.summary || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* ── Top Nav ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl p-2">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900">LPGSafe AI</span>
              <Badge className="ml-2 text-xs bg-violet-100 text-violet-700 border-0">
                Decision Support
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">
              <StatusDot available={mlAvailable} />
              {mlAvailable ? "ML Service Online" : "ML Service Offline"}
            </span>
            <Button size="sm" variant="outline" onClick={loadData} className="gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Link href="/admin">
              <Button size="sm" variant="ghost" className="gap-1 text-slate-600">
                ← Admin
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Disclaimer Banner ── */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <strong>AI Decision-Support Only.</strong> All predictions are generated from{" "}
            <strong>synthetic training data</strong> and are for decision-support purposes only.
            Human review is mandatory before any regulatory action. AI does not make legally binding
            decisions or replace emergency services.
          </p>
        </div>

        {/* ── ML Service Status ── */}
        {!mlAvailable && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <strong>Python ML service is not running.</strong> AI prediction features are
              unavailable. To start:{" "}
              <code className="bg-amber-100 px-1 rounded">
                cd ml && pip install -r requirements.txt && python src/generate_synthetic_data.py &&
                python src/train_risk_model.py && uvicorn api.main:app --port 8000
              </code>
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={ShieldAlert}
            label="High-Risk Dealers"
            value={summary.highRiskDealers ?? "—"}
            sub="Unresolved AI alerts"
            color="bg-red-500"
            href="/admin/ai#alerts"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Price Anomalies"
            value={summary.priceAnomalies ?? "—"}
            sub="Pending review"
            color="bg-orange-500"
            href="/admin/ai#alerts"
          />
          <SummaryCard
            icon={Cpu}
            label="Supply Alerts"
            value={summary.demandShortages ?? "—"}
            sub="Demand shortages"
            color="bg-blue-500"
            href="/admin/ai#alerts"
          />
          <SummaryCard
            icon={Brain}
            label="Models Trained"
            value={models.filter((m) => m.is_trained).length}
            sub={`of ${models.length} configured`}
            color="bg-violet-600"
            href="/admin/ai/models"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-100 p-1 shadow-sm w-fit">
          {(["OVERVIEW", "ALERTS", "PREDICTIONS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-violet-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab === "OVERVIEW" ? "Overview" : tab === "ALERTS" ? "AI Alerts" : "Predictions"}
              {tab === "ALERTS" && summary.totalUnresolved > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {summary.totalUnresolved}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Safety Risk Trend */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Safety Risk Trends</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      DEMO — Synthetic training data
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-slate-300" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={RISK_TREND_DATA}>
                    <defs>
                      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="highRisk" name="High Risk" stroke="#ef4444" fill="url(#redGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" fill="none" strokeDasharray="4 2" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Price Anomaly Trends */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Price Anomaly Detection</h3>
                    <p className="text-xs text-slate-400 mt-0.5">DEMO — Synthetic training data</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-300" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={PRICE_ANOMALY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="anomalies" name="Flagged" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actionTaken" name="Action Taken" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Demand Forecast */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">LPG Demand Forecast</h3>
                    <p className="text-xs text-slate-400 mt-0.5">DEMO — kg/week · Dhaka Division</p>
                  </div>
                  <Activity className="w-5 h-5 text-slate-300" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={DEMAND_FORECAST_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => `${v?.toLocaleString()} kg`} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                    <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Risk Factors */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Top Risk Factors</h3>
                  <span className="text-xs text-slate-400">DEMO data</span>
                </div>
                <div className="space-y-3">
                  {TOP_RISK_FACTORS.map((f, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700">{f.factor}</span>
                        <span className="text-slate-500 font-medium">{f.count} dealers</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all"
                          style={{ width: `${f.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Status Cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Active AI Models</h3>
                <Link href="/admin/ai/models">
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    Manage Models <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="text-sm text-slate-400 py-4 text-center">Loading models…</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: "safety_risk_model",     name: "Safety Risk",     icon: Shield,    color: "text-red-600    bg-red-50"     },
                    { key: "price_anomaly_model",    name: "Price Anomaly",   icon: TrendingUp, color: "text-orange-600 bg-orange-50"  },
                    { key: "demand_forecast_model",  name: "Demand Forecast", icon: BarChart2,  color: "text-blue-600   bg-blue-50"    },
                    { key: "complaint_classifier",   name: "Complaint AI",    icon: Brain,      color: "text-violet-600 bg-violet-50"  },
                  ].map((m) => {
                    const live = models.find((lm) => lm.id === m.key);
                    const trained = live?.is_trained;
                    const Ic = m.icon;
                    return (
                      <div key={m.key} className="border border-slate-100 rounded-xl p-3 hover:border-violet-200 transition-colors">
                        <div className={`rounded-lg p-2 w-fit mb-2 ${m.color}`}>
                          <Ic className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {trained ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span className="text-xs text-emerald-600">Trained</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-300" />
                              <span className="text-xs text-slate-400">Not trained</span>
                            </>
                          )}
                        </div>
                        {live?.metrics?.best_metrics?.f1 && (
                          <p className="text-xs text-slate-400 mt-1">
                            F1: {(live.metrics.best_metrics.f1 * 100).toFixed(1)}%
                          </p>
                        )}
                        {live?.metrics?.roc_auc && (
                          <p className="text-xs text-slate-400 mt-1">
                            AUC: {(live.metrics.roc_auc * 100).toFixed(1)}%
                          </p>
                        )}
                        {live?.metrics?.cv_mae_avg && (
                          <p className="text-xs text-slate-400 mt-1">
                            MAE: {Math.round(live.metrics.cv_mae_avg).toLocaleString()} kg
                          </p>
                        )}
                        {live?.metrics?.accuracy && (
                          <p className="text-xs text-slate-400 mt-1">
                            Acc: {(live.metrics.accuracy * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ALERTS ── */}
        {activeTab === "ALERTS" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">AI-Generated Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Requires human review before any regulatory action.
              </p>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading alerts…</div>
            ) : (alerts?.alerts || []).length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No unresolved AI alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(alerts?.alerts || []).map((alert: any) => (
                  <div key={alert.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                    <div
                      className={`rounded-lg p-2 flex-shrink-0 ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100"
                          : alert.severity === "HIGH"
                          ? "bg-orange-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          alert.severity === "CRITICAL"
                            ? "text-red-600"
                            : alert.severity === "HIGH"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800 truncate">{alert.title}</p>
                        <Badge
                          className={`text-xs flex-shrink-0 border-0 ${
                            alert.severity === "CRITICAL"
                              ? "bg-red-100 text-red-700"
                              : alert.severity === "HIGH"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-xs text-slate-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <Badge className="text-xs bg-slate-100 text-slate-600 border-0">
                          {alert.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    {alert.entityType === "DEALER" && (
                      <Link href={`/dealers/${alert.entityId}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1 flex-shrink-0">
                          <Eye className="w-3 h-3" /> View
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PREDICTIONS ── */}
        {activeTab === "PREDICTIONS" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Recent AI Predictions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All predictions stored with input/output for audit.
                </p>
              </div>
              <Link href="/admin/ai/training">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1 text-xs">
                  <Play className="w-3 h-3" /> Run Training
                </Button>
              </Link>
            </div>
            <div className="p-8 text-center">
              <Brain className="w-10 h-10 text-violet-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Predictions appear here as they are made</p>
              <p className="text-xs text-slate-400 mt-1">
                Submit an inspection or price record to trigger an AI prediction.
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                <Link href="/inspector/dashboard">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Shield className="w-3 h-3" /> Inspections
                  </Button>
                </Link>
                <Link href="/prices">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <TrendingUp className="w-3 h-3" /> Price Records
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
