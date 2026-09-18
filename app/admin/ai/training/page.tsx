"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Brain,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Terminal,
  Database,
  Shield,
  TrendingUp,
  Activity,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRAINING_STEPS = [
  {
    step: 1,
    title: "Generate Synthetic Dataset",
    cmd: "python ml/src/generate_synthetic_data.py",
    desc: "Creates 10k safety + 20k price + 5k demand + 3k complaint records. All clearly labelled SYNTHETIC.",
    output: "✅ Safety data: 10,000 rows → ml/data/processed/safety_data.csv\n✅ Price data: 20,000 rows → ml/data/processed/price_data.csv\n✅ Demand data: 5,000 rows → ml/data/processed/demand_data.csv\n✅ Complaint data: 3,000 rows → ml/data/processed/complaint_data.csv",
  },
  {
    step: 2,
    title: "Train Safety Risk Model",
    cmd: "python ml/src/train_risk_model.py",
    desc: "Trains Logistic Regression, Random Forest, XGBoost. Selects best by F1. Saves model + metrics JSON.",
    output: "── XGBoost ──\n  Accuracy:  0.9120\n  Recall:    0.8847  ← key metric\n  F1:        0.8931\n  ROC-AUC:   0.9654\n✅ Best model: XGBoost  (F1=0.8931)\n   Saved to: ml/models/safety_risk_model.joblib",
  },
  {
    step: 3,
    title: "Train Price Anomaly Model",
    cmd: "python ml/src/train_price_model.py",
    desc: "Trains Isolation Forest for price anomaly detection. Uses ~8% contamination rate from data.",
    output: "── Isolation Forest ──\n  ROC-AUC:   0.9210\n  Precision (Anomaly): 0.7840\n  Recall    (Anomaly): 0.8120\n✅ Saved to: ml/models/price_anomaly_model.joblib",
  },
  {
    step: 4,
    title: "Train Demand Forecast Model",
    cmd: "python ml/src/train_demand_model.py",
    desc: "XGBoost regression with 5-fold time-series CV. Validates on held-out future time periods.",
    output: "  Fold 1: MAE=3840  RMSE=5120  R²=0.9231\n  Fold 2: MAE=3920  RMSE=5280  R²=0.9180\n  ...\n── CV Summary ──\n  Avg MAE:  3880 kg\n  Avg RMSE: 5200 kg\n  Avg R²:   0.9205\n✅ Saved to: ml/models/demand_forecast_model.joblib",
  },
  {
    step: 5,
    title: "Train Complaint Classifier",
    cmd: "python ml/src/train_complaint_model.py",
    desc: "TF-IDF + Logistic Regression pipeline for 7-class complaint categorization.",
    output: "── TF-IDF + Logistic Regression ──\n  Accuracy: 0.9480\n  F1 (weighted): 0.9461\n✅ Saved to: ml/models/complaint_classifier.joblib",
  },
  {
    step: 6,
    title: "Start FastAPI ML Service",
    cmd: "uvicorn ml.api.main:app --host 0.0.0.0 --port 8000 --reload",
    desc: "Starts the Python prediction service. Must remain running for AI features in Next.js to work.",
    output: "INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)\nINFO:     Started reloader process\nINFO:     Application startup complete.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-slate-400 hover:text-slate-200 transition-colors"
      title="Copy command"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AITrainingPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/admin/ai">
            <Button size="sm" variant="ghost" className="gap-1 text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" /> AI Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <Terminal className="w-5 h-5 text-violet-400" />
          <h1 className="font-bold text-white">AI Training Console</h1>
          <Link href="/admin/ai/models" className="ml-auto">
            <Button size="sm" variant="outline" className="gap-1 text-xs border-slate-600 text-slate-300 hover:bg-slate-800">
              <Brain className="w-3.5 h-3.5" /> Model Registry
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            <strong>Training runs on the Python ML service.</strong> This console shows the commands
            to run in your terminal. Training does NOT happen in the browser. All models are trained
            on <strong>SYNTHETIC data</strong>. Metrics will differ if trained on real data.
          </p>
        </div>

        {/* Info box */}
        <div className="mb-8 bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-400" /> Prerequisites
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 mb-1">Install Python dependencies:</p>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-emerald-400 flex items-center justify-between">
                <span>pip install -r ml/requirements.txt</span>
                <CopyButton text="pip install -r ml/requirements.txt" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Set environment variable:</p>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-emerald-400 flex items-center justify-between">
                <span>ML_API_KEY=dev-ml-secret-key</span>
                <CopyButton text="ML_API_KEY=dev-ml-secret-key" />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Requires Python 3.9+ with scikit-learn, xgboost, fastapi, uvicorn, pandas, numpy,
            joblib, shap, matplotlib.
          </p>
        </div>

        {/* Training Steps */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Training Pipeline — Run in Order
        </h2>
        <div className="space-y-3">
          {TRAINING_STEPS.map((s) => (
            <div
              key={s.step}
              className={`bg-slate-800/60 rounded-2xl border transition-all ${
                expandedStep === s.step
                  ? "border-violet-600/50 shadow-lg shadow-violet-900/20"
                  : "border-slate-700/50 hover:border-slate-600/50"
              }`}
            >
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    expandedStep === s.step
                      ? "bg-violet-600 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{s.cmd}</p>
                </div>
                {s.step === 6 ? (
                  <Badge className="text-xs bg-emerald-900/60 text-emerald-400 border-0">Start Service</Badge>
                ) : (
                  <Badge className="text-xs bg-slate-700 text-slate-300 border-0">Training</Badge>
                )}
              </button>

              {expandedStep === s.step && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{s.desc}</p>

                  {/* Command */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Run this command from the project root:</p>
                    <div className="bg-slate-900 rounded-xl p-3 font-mono text-sm text-emerald-400 flex items-center justify-between gap-2">
                      <span className="truncate">{s.cmd}</span>
                      <CopyButton text={s.cmd} />
                    </div>
                  </div>

                  {/* Expected output */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Expected output (values from SYNTHETIC data):</p>
                    <div className="bg-slate-900/80 rounded-xl p-3 font-mono text-xs text-slate-300 whitespace-pre leading-relaxed border border-slate-700/50">
                      {s.output}
                    </div>
                  </div>

                  {s.step < 6 && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Saves model to: <code className="text-slate-400">ml/models/</code>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* After training */}
        <div className="mt-8 bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">After Training</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li>• Visit <Link href="/admin/ai/models" className="text-violet-400 hover:underline">Model Registry</Link> to see real metrics from your training run</li>
            <li>• Click <strong>Activate</strong> on models you want in production</li>
            <li>• Submit an inspection to trigger a live Safety Risk prediction</li>
            <li>• Add a price record to trigger Price Anomaly detection</li>
            <li>• Submit a complaint to trigger auto-classification</li>
            <li>• Check <Link href="/admin/ai" className="text-violet-400 hover:underline">AI Dashboard</Link> for alerts and predictions</li>
          </ul>
        </div>

        {/* Compare models note */}
        <div className="mt-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Model Comparison
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The safety risk model automatically compares Logistic Regression, Random Forest, and
            XGBoost — selecting the best by F1 score (with emphasis on recall for high-risk cases).
            To compare manually, check the metrics JSON files in{" "}
            <code className="text-slate-300">ml/models/safety_risk_metrics.json</code> after training.
          </p>
        </div>
      </main>
    </div>
  );
}
