"""
LPGSafe Bangladesh — Safety Risk Model Training
================================================
Trains and compares Logistic Regression, Random Forest, and XGBoost
on the synthetic safety dataset. Saves the best model.

Run: python ml/src/train_risk_model.py
Requires: ml/data/processed/safety_data.csv (run generate_synthetic_data.py first)
"""

import os, json, warnings
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
import xgboost as xgb

warnings.filterwarnings("ignore")

DATA_PATH   = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "safety_data.csv")
MODELS_DIR  = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURES = [
    "inspection_failures",
    "previous_violations",
    "complaints_last_90_days",
    "leakage_complaints",
    "certification_expired",
    "cylinder_age_days",
    "regulator_condition_enc",
    "tube_condition_enc",
    "installation_ok",
    "storage_ok",
    "ventilation_ok",
    "fire_equipment",
    "days_since_inspection",
]
TARGET = "high_risk"


def evaluate(model, X_test, y_test, model_name):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred

    acc      = accuracy_score(y_test, y_pred)
    prec     = precision_score(y_test, y_pred, zero_division=0)
    rec      = recall_score(y_test, y_pred, zero_division=0)
    f1       = f1_score(y_test, y_pred, zero_division=0)
    auc      = roc_auc_score(y_test, y_prob)
    cm       = confusion_matrix(y_test, y_pred).tolist()

    print(f"\n── {model_name} ──")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}  ← key metric for high-risk detection")
    print(f"  F1:        {f1:.4f}")
    print(f"  ROC-AUC:   {auc:.4f}")
    print(f"  Confusion Matrix: {cm}")

    return {
        "model_name":  model_name,
        "accuracy":    round(acc,  4),
        "precision":   round(prec, 4),
        "recall":      round(rec,  4),
        "f1":          round(f1,   4),
        "roc_auc":     round(auc,  4),
        "confusion_matrix": cm,
    }


def train():
    print("=" * 60)
    print("LPGSafe — Safety Risk Model Training")
    print("WARNING: Training on SYNTHETIC data. Results are for demo only.")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)
    print(f"\nLoaded {len(df):,} records | High-risk rate: {df[TARGET].mean():.1%}")

    X = df[FEATURES].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Scale for LogReg
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    results = []

    # ── Logistic Regression ────────────────────────────────────────────────
    lr = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    lr.fit(X_train_scaled, y_train)
    # Wrap for consistent predict interface
    class ScaledModel:
        def __init__(self, model, scaler):
            self.model = model
            self.scaler = scaler
        def predict(self, X):
            return self.model.predict(self.scaler.transform(X))
        def predict_proba(self, X):
            return self.model.predict_proba(self.scaler.transform(X))

    lr_wrapped = ScaledModel(lr, scaler)
    results.append(evaluate(lr_wrapped, X_test, y_test, "Logistic Regression"))

    # ── Random Forest ──────────────────────────────────────────────────────
    rf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42,
                                 class_weight="balanced", n_jobs=-1)
    rf.fit(X_train, y_train)
    results.append(evaluate(rf, X_test, y_test, "Random Forest"))

    # ── XGBoost ──────────────────────────────────────────────────────────
    scale_pos = (y_train == 0).sum() / (y_train == 1).sum()
    xgb_model = xgb.XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.05,
        scale_pos_weight=scale_pos, random_state=42,
        eval_metric="logloss", verbosity=0
    )
    xgb_model.fit(X_train, y_train,
                  eval_set=[(X_test, y_test)],
                  verbose=False)
    results.append(evaluate(xgb_model, X_test, y_test, "XGBoost"))

    # ── Select best by F1 ────────────────────────────────────────────────
    best = max(results, key=lambda r: r["f1"])
    best_name = best["model_name"]
    print(f"\n✅ Best model: {best_name}  (F1={best['f1']:.4f}, Recall={best['recall']:.4f})")

    # Save best model artifact
    model_artifact_path = os.path.join(MODELS_DIR, "safety_risk_model.joblib")
    if best_name == "Random Forest":
        joblib.dump({"model": rf, "features": FEATURES, "scaler": None}, model_artifact_path)
    elif best_name == "XGBoost":
        joblib.dump({"model": xgb_model, "features": FEATURES, "scaler": None}, model_artifact_path)
    else:
        joblib.dump({"model": lr, "features": FEATURES, "scaler": scaler}, model_artifact_path)

    print(f"   Saved to: {model_artifact_path}")

    # Save full metrics JSON
    metrics_path = os.path.join(MODELS_DIR, "safety_risk_metrics.json")
    metrics_output = {
        "dataset": "SYNTHETIC — LPGSafe Bangladesh Demo Data",
        "training_date": datetime.utcnow().isoformat() + "Z",
        "dataset_size": len(df),
        "test_size": len(y_test),
        "high_risk_rate": round(float(df[TARGET].mean()), 4),
        "features": FEATURES,
        "best_model": best_name,
        "all_results": results,
        "best_metrics": best,
        "disclaimer": (
            "These metrics are derived from SYNTHETIC training data "
            "generated for demonstration purposes only. "
            "Do not use for real regulatory enforcement."
        ),
    }
    with open(metrics_path, "w") as f:
        json.dump(metrics_output, f, indent=2)
    print(f"   Metrics saved to: {metrics_path}")

    return model_artifact_path, metrics_output


if __name__ == "__main__":
    train()
