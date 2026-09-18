"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  Shield,
  TrendingUp,
  Activity,
  ChevronLeft,
  RefreshCw,
  Play,
  Pause,
  Info,
  Award,
  Database,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MODEL_META: Record<string, {
  name: string;
  icon: any;
  color: string;
  borderColor: string;
  description: string;
  task: string;
}> = {
  safety_risk_model: {
    name:        "Safety Risk Predictor",
    icon:        Shield,
    color:       "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    description: "Predicts high-risk dealers based on inspection history, violations, and safety features. Uses Logistic Regression, Random Forest, and XGBoost — best model selected by F1 score.",
    task:        "Binary Classification",
  },
  price_anomaly_model: {
    name:        "Price Anomaly Detector",
    icon:        TrendingUp,
    color:       "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
    description: "Detects unusual LPG pricing reports using Isolation Forest. Flags potential violations for human review. AI does not declare guilt.",
    task:        "Anomaly Detection",
  },
  demand_forecast_model: {
    name:        "Demand Forecaster",
    icon:        Activity,
    color:       "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    description: "XGBoost regression model with time-series cross-validation forecasting district-level weekly LPG demand. Helps with supply planning.",
    task:        "Regression",
  },
  complaint_classifier: {
    name:        "Complaint Classifier",
    icon:        Brain,
    color:       "bg-violet-100 text-violet-600",
    borderColor: "border-violet-200",
    description: "TF-IDF + Logistic Regression pipeline for multi-class complaint categorization. Suggests priority level for human reviewers.",
    task:        "Multi-class Classification",
  },
};

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ModelCard({
  modelKey,
  liveData,
  onActivate,
  isUpdating,
}: {
  modelKey: string;
  liveData: any;
  onActivate: (key: string, action: "activate" | "deactivate") => void;
  isUpdating: boolean;
}) {
  const meta = MODEL_META[modelKey];
  if (!meta) return null;
  const Icon = meta.icon;
  const metrics = liveData?.metrics || {};
  const isTrained = liveData?.is_trained || false;
  const isActive = liveData?.dbStatus === "ACTIVE";

  const renderMetrics = () => {
    if (!isTrained) {
      return (
        <div className="text-center py-4">
          <XCircle className="w-6 h-6 text-slate-200 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Model not yet trained</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Run: <code className="bg-slate-100 px-1 rounded">python ml/src/train_{modelKey.replace("_model","")}.py</code>
          </p>
        </div>
      );
    }

    // Classification models
    const bm = metrics.best_metrics || {};
    if (bm.accuracy !== undefined) {
      return (
        <div className="grid grid-cols-4 gap-2">
          <MetricPill label="Accuracy"  value={`${(bm.accuracy  * 100).toFixed(1)}%`} />
          <MetricPill label="Precision" value={`${(bm.precision * 100).toFixed(1)}%`} />
          <MetricPill label="Recall"    value={`${(bm.recall    * 100).toFixed(1)}%`} />
          <MetricPill label="ROC-AUC"   value={`${(bm.roc_auc   * 100).toFixed(1)}%`} />
        </div>
      );
    }

    // Anomaly detection
    if (metrics.roc_auc !== undefined && metrics.cv_mae_avg === undefined) {
      return (
        <div className="grid grid-cols-4 gap-2">
          <MetricPill label="ROC-AUC"   value={`${(metrics.roc_auc              * 100).toFixed(1)}%`} />
          <MetricPill label="Precision" value={`${(metrics.anomaly_precision    * 100).toFixed(1)}%`} />
          <MetricPill label="Recall"    value={`${(metrics.anomaly_recall       * 100).toFixed(1)}%`} />
          <MetricPill label="Samples"   value={metrics.dataset_size?.toLocaleString() || "—"} />
        </div>
      );
    }

    // Regression
    if (metrics.cv_mae_avg !== undefined) {
      return (
        <div className="grid grid-cols-4 gap-2">
          <MetricPill label="MAE"   value={`${Math.round(metrics.cv_mae_avg).toLocaleString()} kg`} />
          <MetricPill label="RMSE"  value={`${Math.round(metrics.cv_rmse_avg).toLocaleString()} kg`} />
          <MetricPill label="R²"    value={metrics.cv_r2_avg?.toFixed(3) || "—"} />
          <MetricPill label="Folds" value="5-fold TS" />
        </div>
      );
    }

    // Multi-class
    if (metrics.accuracy !== undefined) {
      return (
        <div className="grid grid-cols-4 gap-2">
          <MetricPill label="Accuracy"   value={`${(metrics.accuracy   * 100).toFixed(1)}%`} />
          <MetricPill label="F1 (wtd)"   value={`${(metrics.f1_weighted * 100).toFixed(1)}%`} />
          <MetricPill label="Classes"    value={metrics.categories?.length || "—"} />
          <MetricPill label="Samples"    value={metrics.dataset_size?.toLocaleString() || "—"} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isTrained ? meta.borderColor : "border-slate-100"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${meta.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{meta.name}</h3>
              <Badge className="text-xs bg-slate-100 text-slate-600 border-0 mt-0.5">{meta.task}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isTrained ? (
              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Trained
              </Badge>
            ) : (
              <Badge className="text-xs bg-slate-100 text-slate-500 border-0">Not Trained</Badge>
            )}
            {isActive && (
              <Badge className="text-xs bg-blue-100 text-blue-700 border-0">Active</Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-4">{meta.description}</p>

        {/* Metrics */}
        {renderMetrics()}

        {/* Training info */}
        {isTrained && metrics.training_date && (
          <div className="flex items-center gap-1.5 mt-3">
            <Clock className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-slate-400">
              Trained: {new Date(metrics.training_date).toLocaleString()}
            </span>
            {metrics.dataset && (
              <Badge className="text-xs bg-amber-50 text-amber-600 border-0 ml-1">
                {metrics.dataset.includes("SYNTHETIC") ? "SYNTHETIC DATA" : metrics.dataset}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {isTrained && (
            <Button
              size="sm"
              variant={isActive ? "outline" : "primary"}
              disabled={isUpdating}
              onClick={() => onActivate(modelKey, isActive ? "deactivate" : "activate")}
              className={`text-xs gap-1 ${isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-violet-600 hover:bg-violet-700"}`}
            >
              {isActive ? (
                <><Pause className="w-3 h-3" /> Deactivate</>
              ) : (
                <><Play className="w-3 h-3" /> Activate</>
              )}
            </Button>
          )}
          <Link href="/admin/ai/training">
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <BarChart2 className="w-3 h-3" /> Training
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AIModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [mlAvailable, setMlAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/models").then((r) => r.json());
      if (res.success) {
        setModels(res.models || []);
        setMlAvailable(res.mlServiceAvailable || false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleActivate = async (modelKey: string, action: "activate" | "deactivate") => {
    setIsUpdating(true);
    try {
      await fetch(`/api/ai/models/${modelKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/admin/ai">
            <Button size="sm" variant="ghost" className="gap-1 text-slate-600">
              <ChevronLeft className="w-4 h-4" /> AI Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <Brain className="w-5 h-5 text-violet-600" />
          <h1 className="font-bold text-slate-900">AI Model Registry</h1>
          <div className="ml-auto flex gap-2">
            <span className="text-xs text-slate-400">
              {mlAvailable ? "🟢 ML Service Online" : "🔴 ML Service Offline"}
            </span>
            <Button size="sm" variant="outline" onClick={load} className="gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Only administrators can activate or deactivate production models. Models are trained on{" "}
            <strong>SYNTHETIC data</strong> for demonstration purposes. Metrics shown are from actual
            training runs, not fabricated. Do not use for real regulatory enforcement.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <Database className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{models.length}</p>
            <p className="text-xs text-slate-400">Configured Models</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{models.filter((m) => m.is_trained).length}</p>
            <p className="text-xs text-slate-400">Models Trained</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <Target className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{models.filter((m) => m.dbStatus === "ACTIVE").length}</p>
            <p className="text-xs text-slate-400">Active in Production</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading model registry…</div>
        ) : (
          <div className="grid gap-5">
            {Object.keys(MODEL_META).map((key) => {
              const live = models.find((m) => m.id === key);
              return (
                <ModelCard
                  key={key}
                  modelKey={key}
                  liveData={live}
                  onActivate={handleActivate}
                  isUpdating={isUpdating}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
