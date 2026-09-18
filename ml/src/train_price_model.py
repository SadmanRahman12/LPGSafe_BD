"""
LPGSafe Bangladesh — Price Anomaly Detection Training
=====================================================
Trains Isolation Forest for detecting unusual LPG price reports.

Run: python ml/src/train_price_model.py
"""

import os, json, warnings
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

warnings.filterwarnings("ignore")

DATA_PATH  = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "price_data.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURES = [
    "cylinder_size_kg",
    "reported_price",
    "reference_price",
    "historical_avg_price",
    "regional_avg_price",
    "price_deviation_pct",
    "day_of_week",
    "month",
]


def train():
    print("=" * 60)
    print("LPGSafe — Price Anomaly Detection Training")
    print("WARNING: Training on SYNTHETIC data.")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)
    print(f"\nLoaded {len(df):,} records | Anomaly rate: {df.is_anomaly.mean():.1%}")

    X     = df[FEATURES].values
    y_true = df["is_anomaly"].values

    scaler  = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Isolation Forest: contamination ≈ known anomaly rate
    contamination = float(y_true.mean())
    iso = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
        n_jobs=-1,
    )
    iso.fit(X_scaled)

    # Map Isolation Forest output to 0/1
    # IsolationForest returns 1 = normal, -1 = anomaly
    raw_preds = iso.predict(X_scaled)
    y_pred    = np.where(raw_preds == -1, 1, 0)
    scores    = -iso.score_samples(X_scaled)  # higher = more anomalous

    # Evaluate
    cm   = confusion_matrix(y_true, y_pred).tolist()
    auc  = roc_auc_score(y_true, scores)
    report = classification_report(y_true, y_pred, target_names=["Normal", "Anomaly"], output_dict=True)

    print(f"\n── Isolation Forest ──")
    print(f"  ROC-AUC:   {auc:.4f}")
    print(f"  Precision (Anomaly): {report['Anomaly']['precision']:.4f}")
    print(f"  Recall    (Anomaly): {report['Anomaly']['recall']:.4f}")
    print(f"  F1        (Anomaly): {report['Anomaly']['f1-score']:.4f}")
    print(f"  Confusion Matrix: {cm}")

    # Save
    model_path = os.path.join(MODELS_DIR, "price_anomaly_model.joblib")
    joblib.dump({"model": iso, "scaler": scaler, "features": FEATURES, "contamination": contamination},
                model_path)
    print(f"\n✅ Saved to: {model_path}")

    metrics = {
        "dataset": "SYNTHETIC — LPGSafe Bangladesh Demo Data",
        "training_date": datetime.utcnow().isoformat() + "Z",
        "dataset_size": len(df),
        "anomaly_rate": round(float(y_true.mean()), 4),
        "algorithm": "Isolation Forest",
        "contamination": contamination,
        "features": FEATURES,
        "roc_auc": round(auc, 4),
        "anomaly_precision": round(report["Anomaly"]["precision"], 4),
        "anomaly_recall": round(report["Anomaly"]["recall"], 4),
        "anomaly_f1": round(report["Anomaly"]["f1-score"], 4),
        "total_anomalies_detected": int(y_pred.sum()),
        "confusion_matrix": cm,
        "disclaimer": "SYNTHETIC training data. For demo only.",
    }

    metrics_path = os.path.join(MODELS_DIR, "price_anomaly_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"   Metrics: {metrics_path}")
    return model_path, metrics


if __name__ == "__main__":
    train()
